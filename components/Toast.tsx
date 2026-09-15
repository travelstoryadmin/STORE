'use client';
import {Check} from 'lucide-react';import {useToast} from '@/lib/store';
export default function Toast(){const t=useToast();return t?<div className="toast"><Check size={16}/>{t}</div>:null}
