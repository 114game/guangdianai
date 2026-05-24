import prisma from '../config/prisma';
import fetch from 'node-fetch';
import logger from '../config/logger';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIService {
  // 统一聊天模型调用
  static async chatCompletion(
    modelId: number,
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ) {
    const model = await prisma.chatModel.findUnique({
      where: { id: modelId }
    });

    if (!model || model.status !== 1) {
      throw new Error('模型不可用');
    }

    const requestBody: ChatCompletionRequest = {
      model: model.code,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${model.apiKey}`
    };

    if (model.headers) {
      Object.assign(headers, model.headers);
    }

    try {
      const response = await fetch(model.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`AI Model Error: ${model.code}`, { status: response.status, error: errorText });
        throw new Error('模型调用失败');
      }

      const data = await response.json() as ChatCompletionResponse;
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
        rawResponse: data
      };
    } catch (error) {
      logger.error('AI Service Error', error);
      throw new Error('模型调用失败');
    }
  }

  // 获取默认模型
  static async getDefaultModel() {
    let model = await prisma.chatModel.findFirst({
      where: { isDefault: true, status: 1 }
    });

    if (!model) {
      model = await prisma.chatModel.findFirst({
        where: { status: 1 },
        orderBy: { sort: 'asc' }
      });
    }

    return model;
  }

  // 文生图
  static async textToImage(
    modelId: number,
    prompt: string,
    options?: any
  ) {
    const model = await prisma.drawingModel.findUnique({
      where: { id: modelId }
    });

    if (!model || model.status !== 1) {
      throw new Error('模型不可用');
    }

    // 这里需要根据具体的图片模型 API 实现
    throw new Error('文生图功能待实现');
  }

  // 图生图
  static async imageToImage(
    modelId: number,
    inputImage: string,
    prompt: string,
    options?: any
  ) {
    const model = await prisma.drawingModel.findUnique({
      where: { id: modelId }
    });

    if (!model || model.status !== 1) {
      throw new Error('模型不可用');
    }

    // 这里需要根据具体的图片模型 API 实现
    throw new Error('图生图功能待实现');
  }
}
