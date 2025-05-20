import { PDFExtract } from 'pdf.js-extract';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';

import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { Document } from 'langchain/document';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Pool } from 'pg';

import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });



// --- PDF text extraction ---
export async function extractTextFromPDF(filePath) {
  const pdfExtract = new PDFExtract();
  const buffer = await fs.readFile(filePath);
  return new Promise((resolve, reject) => {
    pdfExtract.extractBuffer(buffer, {}, (err, data) => {
      if (err) return reject(err);
      const basename = path.parse(filePath).name;
      const numPages = data.pages.length;
      const selectedPages = data.pages.slice(1, numPages - 1);
      const text = selectedPages
        .map(page => page.content.map(item => item.str).join(' '))
        .join('\n');
      resolve({ text, numPages, basename });
    });
  });
}

export async function writePdfTextToFile(filePath) {
  const { text, basename } = await extractTextFromPDF(filePath);
  const textPath = path.resolve(__dirname, '../embedded_data_txt', `${basename}.txt`);
  await fs.writeFile(textPath, text, 'utf-8');
}

// --- vector store setup ---
export async function setupVectorStore() {
  // Set up Postgres pool
  const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
      rejectUnauthorized: false,
    },
});

  // sreate embeddings instance
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAIAPIKEYLC,
  });

  // initialize PGVectorStore
  const vectorStore = await PGVectorStore.initialize(embeddings, {
    pool,
    tableName: 'vector_docs',
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embedding',
      contentColumnName: 'content',
    },
  });

  return vectorStore;
}

// --- load documents from URL ---
export async function loadDocsFromURL(url) {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();
  return docs;
}

// --- split documents ---
export async function splitDocuments(docs, chunkSize = 500, chunkOverlap = 50) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  const splitDocs = await splitter.splitDocuments(docs);
  return splitDocs;
}

// --- setup LLM model ---
export function setupModel() {
  return new ChatOpenAI({
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token) {
          process.stdout.write(token);
        },
      },
    ],
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
    openAIApiKey: process.env.OPENAIAPIKEYLC,
  });
}

// --- setup prompt template ---
export function setupPrompt() {
  return ChatPromptTemplate.fromMessages([
    `Answer the user's question. 
    Context: {context}
    Question: {input}`,
  ]);
}

// --- main controller handler ---
export async function chatbotHandler(req, res) {
  try {
    // 1. setup
    const model = setupModel();
    const prompt = setupPrompt();
    const vectorStore = await setupVectorStore();
    const retriever = vectorStore.asRetriever();

    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: chain,
      retriever,
    });

    // 2. get question and validate it
    const { question } = req.body;

    if (typeof question !== 'string') {
      return res.status(400).json({ error: 'Question must be a string' });
    }

    // 3. run chain
    const result = await retrievalChain.invoke({ input: question });

    // 4. respond
    return res.json({ answer: result.answer });
  } catch (err) {
    console.error("Chatbot handler error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


// test this out if you want!
// (async () => {
//     try {
//       const question = "how fast does sctld spread?";  
//       const answer = await chatbotHandler(question);
//     } catch (error) {
//       console.error("Error running chatbotHandler:", error);
//     } finally {
//       process.exit(0); 
//     }
//   })();