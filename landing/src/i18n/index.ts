import { PL } from './pl';
import { EN } from './en';

const LANGUAGE = import.meta.env.VITE_LANGUAGE || 'pl';

export const t = LANGUAGE === 'en' ? EN : PL;
