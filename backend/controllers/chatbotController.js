import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getMessages = async (req, res) => {
  try {
    const {messages} = req.body;

    const systemMessage = {
      role: 'system',
      content: `You are a helpful expert on Stony Coral Tissue Loss Disease (SCTLD). 
      Provide accurate, scientific information about SCTLD, its effects on coral reefs, 
      prevention methods, and current research. Keep responses clear and concise.`,
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    return res.status(200).json({message: completion.choices[0].message.content});
  } catch (e) {
    console.error('OpenAI API Error:', e);
    return res.status(500).json({message: 'Failed to get response from OpenAI'});
  }
}