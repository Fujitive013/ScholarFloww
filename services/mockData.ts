
import { Thesis, ThesisStatus, Message } from '../types';

const STORAGE_KEY = 'stellaris_vault_v1_theses';
const MESSAGES_KEY = 'stellaris_vault_v1_messages';

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
      total += (localStorage.getItem(key) || '').length * 2; 
    }
  }
  return total;
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

/**
 * Prunes the file content from older versions of theses to save space while keeping metadata
 */
const pruneTheses = (theses: Thesis[]): Thesis[] => {
  return theses.map(t => ({
    ...t,
    versions: t.versions?.map((v, index) => {
      // Keep only metadata for older versions, remove large base64 strings
      // We keep the fileUrl ONLY for the most recent version in the history stack
      if (t.versions && index < t.versions.length - 1) {
        return { ...v, fileUrl: undefined }; 
      }
      return v;
    })
  }));
};

export const updateTheses = (newTheses: Thesis[]) => {
  try {
    const dataString = JSON.stringify(newTheses);
    localStorage.setItem(STORAGE_KEY, dataString);
    window.dispatchEvent(new Event('thesesUpdated'));
  } catch (err: any) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      // If quota exceeded, try pruning older versions and retry once
      try {
        const pruned = pruneTheses(newTheses);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
        window.dispatchEvent(new Event('thesesUpdated'));
        return;
      } catch (innerErr) {
        throw new Error("QUOTA_FULL");
      }
    }
    throw err;
  }
};

export const submitNewThesis = (thesis: Thesis) => {
  const current = getTheses();
  updateTheses([...current, thesis]);
};

// Messaging Services
export const getMessages = (userId: string, otherId: string): Message[] => {
  const stored = localStorage.getItem(MESSAGES_KEY);
  if (!stored) return [];
  const all: Message[] = JSON.parse(stored);
  return all.filter(m => 
    (m.senderId === userId && m.receiverId === otherId) || 
    (m.senderId === otherId && m.receiverId === userId)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const markMessagesAsRead = (userId: string, otherId: string) => {
  const stored = localStorage.getItem(MESSAGES_KEY);
  if (!stored) return;
  const all: Message[] = JSON.parse(stored);
  let changed = false;
  const updated = all.map(m => {
    if (m.receiverId === userId && m.senderId === otherId && !m.read) {
      changed = true;
      return { ...m, read: true };
    }
    return m;
  });
  if (changed) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('messagesUpdated'));
  }
};

export const getUnreadSendersCount = (userId: string): number => {
  const stored = localStorage.getItem(MESSAGES_KEY);
  if (!stored) return 0;
  const all: Message[] = JSON.parse(stored);
  const unreadSenders = new Set(
    all
      .filter(m => m.receiverId === userId && !m.read)
      .map(m => m.senderId)
  );
  return unreadSenders.size;
};

export const getUnreadFromContact = (userId: string, contactId: string): boolean => {
  const stored = localStorage.getItem(MESSAGES_KEY);
  if (!stored) return false;
  const all: Message[] = JSON.parse(stored);
  return all.some(m => m.receiverId === userId && m.senderId === contactId && !m.read);
};

export const saveMessage = (msg: Message) => {
  const stored = localStorage.getItem(MESSAGES_KEY);
  const all: Message[] = stored ? JSON.parse(stored) : [];
  // Default to unread when saving
  const newMsg = { ...msg, read: false };
  localStorage.setItem(MESSAGES_KEY, JSON.stringify([...all, newMsg]));
  window.dispatchEvent(new Event('messagesUpdated'));
};

export const clearAppPath = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(MESSAGES_KEY);
  window.location.reload();
};

export const nuclearReset = () => {
  localStorage.clear();
  window.location.reload();
};
