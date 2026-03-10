import { PL } from './pl';
import { EN } from './en';

const LANGUAGE = import.meta.env.VITE_LANGUAGE || 'pl';

export const isEN = LANGUAGE === 'en';
export const t = isEN ? EN : PL;
