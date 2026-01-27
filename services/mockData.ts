
import { Thesis, ThesisStatus } from '../types';

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
  {
    id: 'p2',
    authorId: 'u2',
    authorName: 'Sarah L. Thompson',
    supervisorName: 'Dr. Kevin Zhang',
    title: 'Blockchain-Based Electronic Voting Systems: Security and Scalability Analysis',
    abstract: 'Electronic voting faces critical challenges regarding voter anonymity and result immutability. This thesis proposes a layer-2 scaling solution for Ethereum.',
    department: 'Engineering',
    year: '2024',
    status: ThesisStatus.PUBLISHED,
    submissionDate: '2023-11-20',
    publishedDate: '2024-01-15',
    keywords: ['Blockchain', 'Cryptography', 'Governance'],
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
  },

  // --- REVIEWER QUEUE MOCKS ---
  {
    id: 'q1',
    authorId: 'u101',
    authorName: 'Leo Messi',
    supervisorName: 'Dr. Pep Guardiola',
    title: 'Kinematics of Low-Gravity Locomotion',
    abstract: 'Analyzing movement patterns in environments with reduced gravitational pull.',
    department: 'Physics',
    year: '2024',
    status: ThesisStatus.PENDING,
    submissionDate: '2024-02-18',
    keywords: ['Physics', 'Kinematics'],
    reviews: []
  },
  {
    id: 'q2',
    authorId: 'u102',
    authorName: 'Serena Williams',
    supervisorName: 'Dr. Venus Williams',
    title: 'Materials Science in High-Performance Sports Equipment',
    abstract: 'Testing composite structures to enhance racket durability.',
    department: 'Engineering',
    year: '2024',
    status: ThesisStatus.UNDER_REVIEW,
    submissionDate: '2024-02-10',
    keywords: ['Materials', 'Sports'],
    reviews: []
  },

  // --- ADMIN QUEUE MOCKS ---
  {
    id: 'app1',
    authorId: 'u201',
    authorName: 'Marie Curie',
    supervisorName: 'Dr. Pierre Curie',
    title: 'Radioactivity: Implications for Modern Medicine',
    abstract: 'A foundational study on radiation physics and medical isotopes.',
    department: 'Physics',
    year: '2024',
    status: ThesisStatus.REVIEWED,
    submissionDate: '2024-01-15',
    keywords: ['Physics', 'Radiation'],
    reviews: [
      { 
        id: 'rev1', 
        reviewerId: 'r1', 
        reviewerName: 'Dr. Albert Einstein', 
        comment: 'The methodology for isolating isotopes is groundbreaking.', 
        date: '2024-02-01', 
        recommendation: 'APPROVE' 
      }
    ]
  },
  {
    id: 'app2',
    authorId: 'u202',
    authorName: 'Ada Lovelace',
    supervisorName: 'Charles Babbage',
    title: 'Algorithmic Potential of the Analytical Engine',
    abstract: 'Exploring computing before computers existed conceptually.',
    department: 'Mathematics',
    year: '2024',
    status: ThesisStatus.REVIEWED,
    submissionDate: '2024-01-10',
    keywords: ['Algorithms', 'Computing'],
    reviews: [
      {
        id: 'rev2',
        reviewerId: 'r2',
        reviewerName: 'Alan Turing',
        comment: 'Fascinating conceptual work, ready for release.',
        date: '2024-02-05',
        recommendation: 'APPROVE'
      }
    ]
  }
];

export const getTheses = (): Thesis[] => {
  const stored = localStorage.getItem('scholarflow_theses');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('scholarflow_theses', JSON.stringify(INITIAL_THESES));
  return INITIAL_THESES;
};

export const updateTheses = (newTheses: Thesis[]) => {
  localStorage.setItem('scholarflow_theses', JSON.stringify(newTheses));
  // Dispatch custom event to notify other components in the same tab
  window.dispatchEvent(new Event('thesesUpdated'));
};
