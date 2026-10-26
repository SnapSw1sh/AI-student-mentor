import folderIcon from '../assets/folder.png';
import mathematicsIcon from '../assets/mathematics.png';
import physicsIcon from '../assets/physics.png';
import unitedKingdomIcon from '../assets/united-kingdom.png';

// TODO(backend): разделов «Материалы» нет ни в API, ни в дизайне — папки по предметам и
// сохранённые материалы взяты из макета главной (PROBLEMS.md#23).
export const SUBJECT_FOLDERS = [
  { id: 'general', title: 'Общие', count: 2, icon: folderIcon },
  { id: 'calculus', title: 'Матанализ', count: 3, icon: mathematicsIcon },
  { id: 'english', title: 'Английский язык', count: 2, icon: unitedKingdomIcon },
  { id: 'physics', title: 'Физика', count: 2, icon: physicsIcon },
];

export const SAVED_MATERIALS = [];
