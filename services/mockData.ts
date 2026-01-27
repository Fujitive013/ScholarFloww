
import { Thesis, ThesisStatus } from '../types';

// Use a more unique key to avoid collisions with other apps on localhost
const STORAGE_KEY = 'stellaris_vault_v1_theses';

export const INITIAL_THESES: Thesis[] = [
  // --- LIBRARY MOCKS (PUBLISHED) ---
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
  
  // --- STUDENT MOCKS (ALEX RIVERA - s1) ---
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
  },
  {
    id: 'mt4',
    authorId: 's1',
    authorName: 'Alex Rivera',
    supervisorName: 'Prof. Marcus Aurelius',
    title: 'Ethical Implications of Autonomous Defense Systems',
    abstract: 'A philosophical examination of algorithmic lethality in modern warfare.',
    department: 'Philosophy',
    year: '2024',
    status: ThesisStatus.REJECTED,
    submissionDate: '2024-01-05',
    keywords: ['Ethics', 'AI'],
    reviews: [
      { id: 'rej1', reviewerId: 'r9', reviewerName: 'Dr. Ethics Board', comment: 'Methodological scope is too narrow for a Doctoral thesis.', date: '2024-02-10', recommendation: 'REJECT' }
    ]
  }
];

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
  
  // If no valid data, initialize with mocks
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
    // Explicitly check for quota error
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      throw new Error("QUOTA_FULL");
    }
    throw err;
  }
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
