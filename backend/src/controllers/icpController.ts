import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/database';
import { AuthRequest } from '../middleware/auth';

interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface AIGenerateRequest {
  conversation: ConversationMessage[];
  currentStep?: string;
}

export const getICPProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await query(
      'SELECT * FROM icp_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ profiles: result.rows });
  } catch (error) {
    console.error('Get ICP profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createICPProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, industries, geography, position_levels, company_sizes } = req.body;

    if (!name || !industries || !geography) {
      return res.status(400).json({ error: 'Name, industries, and geography are required' });
    }

    const profileId = uuidv4();
    await query(
      'INSERT INTO icp_profiles (id, user_id, name, industries, geography, position_levels, company_sizes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [profileId, userId, name, industries, geography, position_levels || [], company_sizes || []]
    );

    const result = await query(
      'SELECT * FROM icp_profiles WHERE id = $1',
      [profileId]
    );

    res.status(201).json({
      message: 'ICP profile created successfully',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Create ICP profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateICPProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, industries, geography, position_levels, company_sizes } = req.body;

    const result = await query(
      'UPDATE icp_profiles SET name = $1, industries = $2, geography = $3, position_levels = $4, company_sizes = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [name, industries, geography, position_levels || [], company_sizes || [], id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ICP profile not found' });
    }

    res.json({
      message: 'ICP profile updated successfully',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Update ICP profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteICPProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await query(
      'DELETE FROM icp_profiles WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ICP profile not found' });
    }

    res.json({ message: 'ICP profile deleted successfully' });
  } catch (error) {
    console.error('Delete ICP profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateICPWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { conversation, currentStep }: AIGenerateRequest = req.body;
    const userId = req.user?.id;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const conversationSteps = [
      'greeting',
      'position_level',
      'industry',
      'company_size', 
      'geography',
      'generate_profile'
    ];

    const stepIndex = currentStep ? conversationSteps.indexOf(currentStep) : 0;
    const nextStep = conversationSteps[stepIndex + 1] || 'generate_profile';

    let aiResponse = '';
    let isComplete = false;
    let generatedProfile = null;

    switch (nextStep) {
      case 'position_level':
        aiResponse = "Отлично! Давайте создадим ваш идеальный профиль клиента. Сначала скажите мне, на какие должности вы хотите таргетироваться? Например: руководители, менеджеры среднего звена, специалисты, или C-level executives?";
        break;
      
      case 'industry':
        aiResponse = "Понятно! Теперь расскажите, в каких отраслях работают ваши идеальные клиенты? Например: технологии, финансы, здравоохранение, образование, или что-то другое?";
        break;
      
      case 'company_size':
        aiResponse = "Отлично! А какой размер компаний вас интересует? Например: стартапы (1-50 сотрудников), средний бизнес (51-500), крупные компании (500+), или корпорации (1000+)?";
        break;
      
      case 'geography':
        aiResponse = "Прекрасно! И последний вопрос - в каких регионах или странах находятся ваши целевые клиенты? Например: Украина, Европа, США, или глобально?";
        break;
      
      case 'generate_profile':
        const extractedInfo = extractInfoFromConversation(conversation);
        
        if (extractedInfo.isComplete) {
          const profileId = uuidv4();
          const profileName = `${extractedInfo.industries[0]} ${extractedInfo.positionLevels[0]}`;
          
          await query(
            'INSERT INTO icp_profiles (id, user_id, name, industries, geography, position_levels, company_sizes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [profileId, userId, profileName, extractedInfo.industries, extractedInfo.geography, extractedInfo.positionLevels, extractedInfo.companySizes]
          );

          const result = await query(
            'SELECT * FROM icp_profiles WHERE id = $1',
            [profileId]
          );

          generatedProfile = result.rows[0];
          isComplete = true;
          aiResponse = `Отлично! Я создал ваш профиль идеального клиента "${profileName}". Профиль включает:\n\n• Должности: ${extractedInfo.positionLevels.join(', ')}\n• Отрасли: ${extractedInfo.industries.join(', ')}\n• Размер компаний: ${extractedInfo.companySizes.join(', ')}\n• География: ${extractedInfo.geography.join(', ')}\n\nТеперь вы можете использовать этот профиль для генерации лидов!`;
        } else {
          aiResponse = "Мне нужно больше информации. Пожалуйста, уточните детали по всем категориям: должности, отрасли, размер компаний и география.";
        }
        break;
      
      default:
        aiResponse = "Привет! Я помогу вам создать профиль идеального клиента (ICP). Я задам несколько вопросов о ваших целевых клиентах, и на основе ваших ответов создам детальный профиль. Готовы начать?";
    }

    res.json({
      message: aiResponse,
      nextStep,
      isComplete,
      profile: generatedProfile
    });

  } catch (error) {
    console.error('AI ICP generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function extractInfoFromConversation(conversation: ConversationMessage[]) {
  const userMessages = conversation.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
  
  const positionLevels: string[] = [];
  const industries: string[] = [];
  const companySizes: string[] = [];
  const geography: string[] = [];

  userMessages.forEach(message => {
    if (message.includes('руководител') || message.includes('директор') || message.includes('ceo') || message.includes('cto')) {
      positionLevels.push('Руководители');
    }
    if (message.includes('менеджер') || message.includes('manager')) {
      positionLevels.push('Менеджеры');
    }
    if (message.includes('специалист') || message.includes('analyst')) {
      positionLevels.push('Специалисты');
    }

    if (message.includes('технолог') || message.includes('it') || message.includes('софт')) {
      industries.push('Технологии');
    }
    if (message.includes('финанс') || message.includes('банк')) {
      industries.push('Финансы');
    }
    if (message.includes('здравоохран') || message.includes('медицин')) {
      industries.push('Здравоохранение');
    }
    if (message.includes('образован') || message.includes('учебн')) {
      industries.push('Образование');
    }

    if (message.includes('стартап') || message.includes('малый') || message.includes('1-50')) {
      companySizes.push('Стартапы (1-50)');
    }
    if (message.includes('средн') || message.includes('51-500')) {
      companySizes.push('Средний бизнес (51-500)');
    }
    if (message.includes('крупн') || message.includes('500+')) {
      companySizes.push('Крупные компании (500+)');
    }

    if (message.includes('украин')) {
      geography.push('Украина');
    }
    if (message.includes('европ')) {
      geography.push('Европа');
    }
    if (message.includes('сша') || message.includes('америк')) {
      geography.push('США');
    }
    if (message.includes('глобальн') || message.includes('весь мир')) {
      geography.push('Глобально');
    }
  });

  return {
    positionLevels: positionLevels.length > 0 ? positionLevels : ['Менеджеры'],
    industries: industries.length > 0 ? industries : ['Технологии'],
    companySizes: companySizes.length > 0 ? companySizes : ['Средний бизнес (51-500)'],
    geography: geography.length > 0 ? geography : ['Украина'],
    isComplete: positionLevels.length > 0 && industries.length > 0 && companySizes.length > 0 && geography.length > 0
  };
}
