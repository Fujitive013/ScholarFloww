
import { Thesis, ThesisStatus } from '../types';

const STORAGE_KEY = 'stellaris_vault_v1_theses';

export const INITIAL_THESES: Thesis[] = [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'Dr. Aris Xanthos',
    supervisorName: 'Prof. Marina Miller',
    title: 'Transformer-Based Models for Clinical Documentation: A Comparative Study',
    abstract: 'This research evaluates the efficacy of fine-tuned transformer architectures, specifically BERT and T5, in the context of automated medical transcription and ICD-10 coding.',
    department: 'Computer Science',
    year: '2023',
    status: ThesisStatus.PUBLISHED,
    submissionDate: '2023-05-12',
    publishedDate: '2023-08-01',
    fileUrl: 'https://arxiv.org/pdf/1706.03762.pdf', 
    keywords: ['NLP', 'Healthcare', 'Machine Learning'],
    reviews: [],
  },
  {
    id: 'mt1',
    authorId: 's1',
    authorName: 'Alex Rivera',
    supervisorName: 'Dr. Robert Smith',
    coResearchers: ['Jane Doe'],
    title: 'Neural Networks in Tactical Football Analysis',
    abstract: 'An exploration into position tracking data for professional sports team optimization.',
    department: 'Data Science',
    year: '2024',
    status: ThesisStatus.UNDER_REVIEW,
    submissionDate: '2024-02-15',
    keywords: ['AI', 'Sports'],
    reviews: [],
    versions: [
       { id: 'v0', timestamp: '2024-02-10 10:00', title: 'Initial Draft: Football AI', abstract: 'Pre-review abstract.' }
    ]
  }
];

// Returns approximate bytes used across ALL of localhost
export const getStorageUsage = () => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += (localStorage.getItem(key) || '').length * 2; // UTF-16 strings use 2 bytes per char
    }
  }
  return total;
};

// Returns approximate bytes used ONLY by this app
export const getAppStorageUsage = () => {
  const data = localStorage.getItem(STORAGE_KEY) || '';
  return data.length * 2;
};

export const getTheses = (): Thesis[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Storage Retrieval Error:", err);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_THESES));
  return INITIAL_THESES;
};

export const updateTheses = (newTheses: Thesis[]) => {
  try {
    const dataString = JSON.stringify(newTheses);
    localStorage.setItem(STORAGE_KEY, dataString);
    window.dispatchEvent(new Event('thesesUpdated'));
  } catch (err: any) {
    console.error("Storage Update Failed:", err);
    // Code 22 is the standard QuotaExceededError in most browsers
    if (err.name === 'QuotaExceededError' || err.code === 22 || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.message.includes('quota')) {
      throw new Error("QUOTA_FULL");
    }
    throw err;
  }
};

export const submitNewThesis = (thesis: Thesis) => {
  const current = getTheses();
  updateTheses([...current, thesis]);
};

export const clearAppPath = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

export const nuclearReset = () => {
  localStorage.clear(); // Wipes everything on localhost
  window.location.reload();
};
