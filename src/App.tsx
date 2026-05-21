import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Dumbbell,
  FileText,
  GraduationCap,
  Headphones,
  HeartPulse,
  Instagram,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Megaphone,
  Menu,
  MessageCircle,
  PlayCircle,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  WalletCards,
  X,
  Youtube,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import logoUrl from '../logo.png';
import {
  isSupabaseConfigured,
  saveDemoLead,
  saveOrganization,
  saveStudent,
  type DemoLead,
  type OrganizationPayload,
  type StudentPayload,
} from './lib/supabase';

type Page = 'marketing' | 'dashboard' | 'studentPortal';
type ModuleKey =
  | 'overview'
  | 'academy'
  | 'students'
  | 'schedule'
  | 'finance'
  | 'workouts'
  | 'assessments'
  | 'contracts'
  | 'sales'
  | 'relationship'
  | 'reports'
  | 'settings';

type Organization = {
  id: string;
  name: string;
  document: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  units: string;
  status: 'Ativa' | 'Implantacao' | 'Trial';
};

type Location = {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  state: string;
};

type Student = {
  organizationId: string;
  organizationName: string;
  locationId: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: 'Ativo' | 'A vencer' | 'Inadimplente' | 'Trial';
  goal: string;
  checkins: number;
  nextClass: string;
  revenue: string;
};

type FeatureTab = {
  key: string;
  label: string;
  icon: LucideIcon;
  title: string;
  text: string;
  bullets: string[];
  stats: string;
};

const modalities = [
  {
    icon: Dumbbell,
    title: 'Academias',
    text: 'Controle catraca, planos, recorrencia, treinos, avaliacao fisica e retenção em uma rotina unica.',
  },
  {
    icon: Sparkles,
    title: 'Estudios',
    text: 'Agenda inteligente, pacotes por sessoes, listas de espera e relacionamento premium para aulas personalizadas.',
  },
  {
    icon: Boxes,
    title: 'Boxes',
    text: 'Turmas, WODs, presenca, ranking, periodizacao e contratos recorrentes para boxes de cross training.',
  },
  {
    icon: Trophy,
    title: 'Lutas',
    text: 'Graduacoes, turmas por faixa, controle financeiro e comunicados segmentados para artes marciais.',
  },
  {
    icon: HeartPulse,
    title: 'Pilates',
    text: 'Sessões por aparelho, pacotes, evolucao, remarcacoes e acompanhamento individual do aluno.',
  },
  {
    icon: CalendarCheck,
    title: 'Quadras',
    text: 'Reservas, mensalistas, avulsos, pagamentos online e ocupacao de horarios em tempo real.',
  },
];

const growthStats = [
  { value: '+18.000', label: 'alunos e contratos organizados em uma unica central' },
  { value: '+43%', label: 'de oportunidades de faturamento mapeadas por funis e recorrencia' },
  { value: '+2,5M', label: 'interacoes de treino, agenda, pagamento e relacionamento monitoradas' },
  { value: '40h', label: 'economia mensal potencial com automacoes de agenda, cobranca e recepcao' },
];

const educationCards = [
  {
    icon: Youtube,
    eyebrow: 'Para o publico',
    title: 'Biblioteca de conteudos',
    text: 'Aulas rapidas sobre contratos digitais, comissoes, vendas de planos, retenção e rotinas de atendimento.',
    action: 'Ver trilhas',
  },
  {
    icon: Instagram,
    eyebrow: 'Tendencias',
    title: 'Playbooks de crescimento',
    text: 'Conteudos diarios com ideias de campanha, sazonalidade, cases operacionais e execucoes para gestores.',
    action: 'Explorar ideias',
  },
  {
    icon: GraduationCap,
    eyebrow: 'Clientes Xbelt',
    title: 'Mentorias e treinamentos',
    text: 'Encontros guiados por especialistas para tirar duvidas e transformar funcionalidades em rotina aplicada.',
    action: 'Reservar vaga',
  },
];

const featureTabs: FeatureTab[] = [
  {
    key: 'gestao',
    label: 'Gestao',
    icon: LayoutDashboard,
    title: 'Gestao pratica para equipes que precisam agir rapido',
    text: 'Painel operacional com planos, contratos, alunos, vendas, indicadores e tarefas da recepcao em um so lugar.',
    bullets: ['Cadastro completo de alunos', 'Planos e contratos digitais', 'Relatorios em tempo real'],
    stats: 'Visao de caixa, presencas e vencimentos no mesmo painel',
  },
  {
    key: 'relacionamento',
    label: 'Relacionamento',
    icon: MessageCircle,
    title: 'Relacionamento organizado para vender e reter mais',
    text: 'Segmentos automaticos para aniversariantes, alunos ausentes, leads de aula experimental e contratos a vencer.',
    bullets: ['CRM por etapa', 'Campanhas por WhatsApp e email', 'Alertas de risco de churn'],
    stats: 'Acoes recomendadas por comportamento do aluno',
  },
  {
    key: 'experiencia',
    label: 'Experiencia',
    icon: Smartphone,
    title: 'Aplicativo do aluno com jornada completa',
    text: 'Treinos, agenda, pagamentos, avaliacoes, planos e comunidade em uma experiencia mobile conectada ao painel.',
    bullets: ['Check-in e agendamento', 'Treinos com historico de carga', 'Pagamentos por PIX, boleto e cartao'],
    stats: 'Menos atrito para o aluno renovar e voltar',
  },
  {
    key: 'retencao',
    label: 'Retencao',
    icon: ShieldCheck,
    title: 'Recorrencia e sinais de abandono antes do problema aparecer',
    text: 'Indicadores de presenca, pagamento, renovacao e engajamento ajudam sua equipe a agir no momento certo.',
    bullets: ['Renovacao recorrente', 'Cobranca automatica', 'Alertas para alunos ausentes'],
    stats: 'Contratos, inadimplencia e risco em tempo real',
  },
  {
    key: 'vendas',
    label: 'Vendas',
    icon: ShoppingCart,
    title: 'Venda planos, produtos e aulas experimentais online',
    text: 'Crie paginas de venda, publique pacotes, acompanhe leads e transforme visitantes em alunos com poucos cliques.',
    bullets: ['Checkout de planos', 'Produtos e extras', 'Agendamento de aula experimental'],
    stats: 'Funil integrado da campanha ate o contrato',
  },
  {
    key: 'automacao',
    label: 'Automacao',
    icon: Zap,
    title: 'Automacoes para ganhar tempo sem perder controle',
    text: 'Cobrancas, lembretes, listas de espera, tarefas e notificacoes trabalham junto com recepcao e instrutores.',
    bullets: ['Lembretes de vencimento', 'Lista de espera automatica', 'Tarefas por responsavel'],
    stats: 'Rotinas padronizadas para todas as unidades',
  },
];

const studentBenefits = [
  'Pagar e renovar mensalidade por cartao, boleto ou PIX',
  'Acessar treinos, videos, cargas, tempo e percepcao de esforco',
  'Agendar aulas, entrar em lista de espera e receber lembretes',
  'Ver avaliacoes fisicas, planos, historico financeiro e comunicados',
  'Interagir com desafios, rankings e comunidade do negocio',
];

const proBenefits = [
  'Criar e editar treinos individuais, grupos e modelos reutilizaveis',
  'Ajustar agendamentos e acompanhar presencas em tempo real',
  'Cadastrar alunos, vender planos e registrar contratos',
  'Consultar financeiro, metas, inadimplencia e indicadores essenciais',
  'Abrir atendimentos internos e tarefas para recepcao ou instrutores',
];

const initialOrganizations: Organization[] = [
  {
    id: 'org-fitprime',
    name: 'FitPrime Jardins',
    document: '12.345.678/0001-90',
    businessType: 'Academia',
    ownerName: 'Carla Mendes',
    email: 'gestao@fitprime.com',
    phone: '(11) 98888-0000',
    city: 'Sao Paulo',
    state: 'SP',
    units: '1',
    status: 'Ativa',
  },
  {
    id: 'org-crosszone',
    name: 'CrossZone Box',
    document: '44.555.666/0001-10',
    businessType: 'Box',
    ownerName: 'Gustavo Lima',
    email: 'operacao@crosszone.com',
    phone: '(21) 97777-0000',
    city: 'Rio de Janeiro',
    state: 'RJ',
    units: '2',
    status: 'Implantacao',
  },
];

const initialLocations: Location[] = [
  {
    id: 'loc-jardins',
    organizationId: 'org-fitprime',
    name: 'Unidade Jardins',
    city: 'Sao Paulo',
    state: 'SP',
  },
  {
    id: 'loc-barra',
    organizationId: 'org-crosszone',
    name: 'Box Barra',
    city: 'Rio de Janeiro',
    state: 'RJ',
  },
  {
    id: 'loc-centro',
    organizationId: 'org-crosszone',
    name: 'Box Centro',
    city: 'Rio de Janeiro',
    state: 'RJ',
  },
];

const initialStudents: Student[] = [
  {
    organizationId: 'org-fitprime',
    organizationName: 'FitPrime Jardins',
    locationId: 'loc-jardins',
    name: 'Marina Costa',
    email: 'marina@exemplo.com',
    phone: '(11) 98888-2100',
    plan: 'Black Anual',
    status: 'Ativo',
    goal: 'Hipertrofia',
    checkins: 18,
    nextClass: 'Hoje, 18:00',
    revenue: 'R$ 2.388',
  },
  {
    organizationId: 'org-crosszone',
    organizationName: 'CrossZone Box',
    locationId: 'loc-barra',
    name: 'Rafael Siqueira',
    email: 'rafael@exemplo.com',
    phone: '(21) 97777-3001',
    plan: 'Cross Mensal',
    status: 'A vencer',
    goal: 'Condicionamento',
    checkins: 12,
    nextClass: 'Amanha, 07:00',
    revenue: 'R$ 279',
  },
  {
    organizationId: 'org-fitprime',
    organizationName: 'FitPrime Jardins',
    locationId: 'loc-jardins',
    name: 'Bianca Torres',
    email: 'bianca@exemplo.com',
    phone: '(31) 96666-4412',
    plan: 'Pilates 2x',
    status: 'Trial',
    goal: 'Mobilidade',
    checkins: 2,
    nextClass: 'Sex, 10:30',
    revenue: 'R$ 0',
  },
  {
    organizationId: 'org-fitprime',
    organizationName: 'FitPrime Jardins',
    locationId: 'loc-jardins',
    name: 'Daniel Martins',
    email: 'daniel@exemplo.com',
    phone: '(41) 95555-9030',
    plan: 'Performance',
    status: 'Inadimplente',
    goal: 'Perda de peso',
    checkins: 6,
    nextClass: 'Qua, 19:00',
    revenue: 'R$ 189',
  },
];

const revenueData = [
  { month: 'Jan', receita: 82, recorrencia: 61, vendas: 21 },
  { month: 'Fev', receita: 88, recorrencia: 64, vendas: 24 },
  { month: 'Mar', receita: 94, recorrencia: 68, vendas: 26 },
  { month: 'Abr', receita: 106, recorrencia: 75, vendas: 31 },
  { month: 'Mai', receita: 121, recorrencia: 84, vendas: 37 },
  { month: 'Jun', receita: 134, recorrencia: 92, vendas: 42 },
];

const retentionData = [
  { name: 'Ativos', value: 72, color: '#16a085' },
  { name: 'A vencer', value: 16, color: '#f59f00' },
  { name: 'Risco', value: 8, color: '#e03131' },
  { name: 'Trial', value: 4, color: '#7048e8' },
];

const classSchedule = [
  { time: '06:30', className: 'Funcional HIIT', coach: 'Lia', spots: '18/22', room: 'Sala 1' },
  { time: '08:00', className: 'Cross Training', coach: 'Caio', spots: '24/24', room: 'Box' },
  { time: '10:30', className: 'Pilates Studio', coach: 'Nina', spots: '5/6', room: 'Studio A' },
  { time: '18:00', className: 'Musculacao orientada', coach: 'Bruno', spots: '31/40', room: 'Piso' },
  { time: '20:00', className: 'Muay Thai', coach: 'Joao', spots: '16/20', room: 'Tatame' },
];

const invoices = [
  { id: '#1048', client: 'Marina Costa', method: 'Cartao recorrente', amount: 'R$ 199,00', status: 'Pago' },
  { id: '#1049', client: 'Rafael Siqueira', method: 'PIX', amount: 'R$ 279,00', status: 'Aberto' },
  { id: '#1050', client: 'Daniel Martins', method: 'Boleto', amount: 'R$ 189,00', status: 'Atrasado' },
  { id: '#1051', client: 'Fernanda Alves', method: 'Cartao recorrente', amount: 'R$ 349,00', status: 'Pago' },
];

const workouts = [
  { title: 'Hipertrofia A', students: 126, focus: 'Peito, ombro e triceps', updated: 'Hoje' },
  { title: 'Base Cross 12 semanas', students: 84, focus: 'Forca, tecnica e condicionamento', updated: 'Ontem' },
  { title: 'Pilates coluna saudavel', students: 38, focus: 'Mobilidade e estabilidade', updated: 'Segunda' },
  { title: 'Performance corrida', students: 51, focus: 'Potencia e prevencao', updated: 'Terça' },
];

const assessments = [
  { metric: 'Peso medio', current: '73,4 kg', change: '-1,8%', tone: 'good' },
  { metric: 'Gordura corporal', current: '21,2%', change: '-4,1%', tone: 'good' },
  { metric: 'Massa magra', current: '48,6 kg', change: '+2,7%', tone: 'good' },
  { metric: 'Avaliacoes vencidas', current: '27', change: '+9', tone: 'warn' },
];

const contractPlans = [
  { name: 'Start Mensal', price: 'R$ 149', contracts: 218, benefit: 'Acesso livre e app do aluno' },
  { name: 'Performance', price: 'R$ 249', contracts: 164, benefit: 'Treino, avaliacao e recorrencia' },
  { name: 'Black Anual', price: 'R$ 199/mês', contracts: 96, benefit: 'Contrato anual e vantagens premium' },
];

const salesPipeline = [
  { stage: 'Novos leads', count: 84, amount: 'R$ 32 mil' },
  { stage: 'Aula experimental', count: 41, amount: 'R$ 18 mil' },
  { stage: 'Proposta enviada', count: 27, amount: 'R$ 13 mil' },
  { stage: 'Contrato fechado', count: 19, amount: 'R$ 9 mil' },
];

const reports = [
  { title: 'DRE simplificado', text: 'Receitas, despesas, margem e previsao de caixa.' },
  { title: 'Retencao e churn', text: 'Contratos cancelados, risco e motivos de saida.' },
  { title: 'Produtividade da equipe', text: 'Vendas, atendimentos, aulas e tarefas por responsavel.' },
  { title: 'Treinos e evolucao', text: 'Carga, frequencia, avaliacoes e aderencia por aluno.' },
];

const testimonials = [
  {
    quote:
      'Centralizamos agenda, cobranca e treinos. A recepcao parou de apagar incendio e passou a vender melhor.',
    author: 'Carla Mendes',
    role: 'Studio boutique',
  },
  {
    quote:
      'A visao de inadimplencia e contratos a vencer mudou nossa rotina. Agora cada consultor sabe exatamente quem acionar.',
    author: 'Gustavo Lima',
    role: 'Academia full service',
  },
  {
    quote:
      'O app do aluno deixou a experiencia mais profissional. Treino, pagamento e avisos estao no mesmo lugar.',
    author: 'Patricia Rocha',
    role: 'Box de cross training',
  },
];

const faqs = [
  {
    question: 'Para que serve o Xbelt?',
    answer:
      'O Xbelt centraliza gestao financeira, contratos, vendas, agenda, treinos, avaliacoes fisicas, relacionamento e relatorios para negocios fitness.',
  },
  {
    question: 'Como funciona a integracao com Supabase?',
    answer:
      'O app usa variaveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. O schema incluso cria tabelas para leads, alunos, planos, financeiro, agenda e treinos.',
  },
  {
    question: 'Quem pode usar?',
    answer:
      'Academias, estudios, boxes, pilates, artes marciais, quadras, escolinhas e operacoes com varias unidades.',
  },
  {
    question: 'Esta pronto para publicar na Vercel?',
    answer:
      'Sim. O projeto usa Vite/React e pode ser publicado como static build. Basta configurar as variaveis de ambiente na Vercel.',
  },
];

const platformModules = [
  { icon: Building2, title: 'Cadastro da academia', text: 'Dados fiscais, responsaveis, unidades, horarios, salas e permissoes.' },
  { icon: Users, title: 'Base de alunos', text: 'Aluno vinculado a uma academia e unidade, com contrato, plano, status e objetivo.' },
  { icon: CalendarDays, title: 'Agenda e turmas', text: 'Aulas, capacidade, lista de espera, presenca, remarcacao e recorrencia.' },
  { icon: WalletCards, title: 'Financeiro', text: 'PIX, boleto, cartao, inadimplencia, DRE, comissoes e previsao de caixa.' },
  { icon: Dumbbell, title: 'Treinos', text: 'Modelos, prescricoes, videos, cargas, onde parou e feedback de esforco.' },
  { icon: ClipboardCheck, title: 'Avaliacoes', text: 'Anamnese, medidas, fotos, evolucao corporal e vencimento de reavaliacao.' },
  { icon: ShoppingCart, title: 'Vendas', text: 'Funil, aula experimental, checkout, campanhas, produtos e contratos digitais.' },
  { icon: MessageCircle, title: 'Relacionamento', text: 'WhatsApp, email, notificacoes, segmentos, risco de churn e tarefas.' },
  { icon: Smartphone, title: 'Portal do aluno', text: 'Pagamentos, treinos, agenda, avaliacoes, comunicados e plano ativo.' },
  { icon: ShieldCheck, title: 'Permissoes', text: 'Perfis para dono, gerente, recepcao, instrutor, financeiro e suporte.' },
  { icon: BarChart3, title: 'Relatorios', text: 'Receita, retencao, ocupacao, vendas, produtividade e aderencia aos treinos.' },
  { icon: Settings, title: 'Integracoes', text: 'Supabase, Vercel, gateways, WhatsApp, catraca, site e automacoes.' },
];

const operatingFlow = [
  {
    title: '1. Cadastre a academia',
    text: 'Crie a organizacao, dados fiscais, responsavel, unidades, salas, equipe e regras comerciais.',
  },
  {
    title: '2. Vincule planos e alunos',
    text: 'Cada aluno nasce dentro de uma academia e unidade, com plano, contrato, financeiro e objetivo.',
  },
  {
    title: '3. Libere a operacao diaria',
    text: 'Agenda, check-in, treinos, avaliacoes, vendas e cobrancas passam a trabalhar juntos.',
  },
  {
    title: '4. Aluno usa o portal',
    text: 'O aluno acessa treino, aula, pagamento, avaliacao, comunicados e historico daquela academia.',
  },
];

const pricingPlans = [
  {
    name: 'Start',
    price: 'R$ 149',
    text: 'Para estudios e operacoes enxutas que precisam sair da planilha.',
    items: ['1 unidade', '300 alunos', 'Agenda, planos e financeiro', 'Portal do aluno'],
  },
  {
    name: 'Scale',
    price: 'R$ 349',
    text: 'Para academias e boxes com equipe, recorrencia e vendas ativas.',
    items: ['Ate 3 unidades', '2.000 alunos', 'CRM, treinos e avaliacoes', 'Relatorios completos'],
  },
  {
    name: 'Network',
    price: 'Sob consulta',
    text: 'Para redes com varias unidades, governanca, BI e implantacao assistida.',
    items: ['Multiunidade', 'Perfis avancados', 'Automacoes e BI', 'Sucesso do cliente dedicado'],
  },
];

const modules: { key: ModuleKey; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'Visao geral', icon: LayoutDashboard },
  { key: 'academy', label: 'Academia', icon: Building2 },
  { key: 'students', label: 'Alunos', icon: Users },
  { key: 'schedule', label: 'Agenda', icon: CalendarDays },
  { key: 'finance', label: 'Financeiro', icon: WalletCards },
  { key: 'workouts', label: 'Treinos', icon: Dumbbell },
  { key: 'assessments', label: 'Avaliacoes', icon: ClipboardCheck },
  { key: 'contracts', label: 'Planos', icon: FileText },
  { key: 'sales', label: 'Vendas', icon: ShoppingCart },
  { key: 'relationship', label: 'Relacionamento', icon: Megaphone },
  { key: 'reports', label: 'Relatorios', icon: BarChart3 },
  { key: 'settings', label: 'Supabase', icon: Settings },
];

const emptyLead: DemoLead = {
  name: '',
  email: '',
  phone: '',
  businessType: 'Academia',
  teamSize: '1 unidade',
  message: '',
};

const emptyStudent: StudentPayload = {
  name: '',
  email: '',
  phone: '',
  plan: 'Start Mensal',
  status: 'Ativo',
  organizationId: 'org-fitprime',
  locationId: 'loc-jardins',
  goal: 'Condicionamento',
};

const emptyOrganization: OrganizationPayload = {
  name: '',
  document: '',
  businessType: 'Academia',
  ownerName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  units: '1',
};

function App() {
  const [page, setPage] = useState<Page>('marketing');
  const [activeFeature, setActiveFeature] = useState(featureTabs[0].key);
  const [activeModule, setActiveModule] = useState<ModuleKey>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalitiesOpen, setModalitiesOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [lead, setLead] = useState<DemoLead>(emptyLead);
  const [leadState, setLeadState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [leadMessage, setLeadMessage] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(initialOrganizations[0].id);
  const [academyForm, setAcademyForm] = useState<OrganizationPayload>(emptyOrganization);
  const [academyState, setAcademyState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentForm, setStudentForm] = useState<StudentPayload>(emptyStudent);
  const [studentState, setStudentState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const selectedFeature = featureTabs.find((item) => item.key === activeFeature) ?? featureTabs[0];
  const selectedOrganization =
    organizations.find((organization) => organization.id === selectedOrganizationId) ?? organizations[0];
  const selectedLocations = locations.filter(
    (location) => location.organizationId === selectedOrganization.id,
  );
  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    const organizationStudents = students.filter(
      (student) => student.organizationId === selectedOrganizationId,
    );
    if (!query) return organizationStudents;
    return organizationStudents.filter((student) =>
      [student.name, student.email, student.plan, student.status, student.goal].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [selectedOrganizationId, studentSearch, students]);

  const SelectedFeatureIcon = selectedFeature.icon;

  function scrollToSection(id: string) {
    setPage('marketing');
    setMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadState('loading');
    setLeadMessage('');

    try {
      const result = await saveDemoLead(lead);
      setLeadState('success');
      setLeadMessage(
        result.offline
          ? 'Lead salvo em modo demonstracao. Configure o Supabase para persistir no banco.'
          : 'Solicitacao recebida. Um consultor pode seguir o fluxo pelo painel.',
      );
      setLead(emptyLead);
    } catch (error) {
      setLeadState('error');
      setLeadMessage(error instanceof Error ? error.message : 'Nao foi possivel enviar o formulario.');
    }
  }

  async function handleStudentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStudentState('loading');

    try {
      await saveStudent(studentForm);
      const organization =
        organizations.find((item) => item.id === studentForm.organizationId) ?? selectedOrganization;
      setStudents((current) => [
        {
          ...studentForm,
          organizationId: studentForm.organizationId ?? selectedOrganization.id,
          organizationName: organization.name,
          locationId: studentForm.locationId ?? selectedLocations[0]?.id ?? '',
          status: studentForm.status as Student['status'],
          goal: studentForm.goal ?? 'Condicionamento',
          checkins: 0,
          nextClass: 'A definir',
          revenue: 'R$ 0',
        },
        ...current,
      ]);
      setStudentForm({
        ...emptyStudent,
        organizationId: selectedOrganization.id,
        locationId: selectedLocations[0]?.id ?? '',
      });
      setStudentState('success');
      window.setTimeout(() => setStudentState('idle'), 2600);
    } catch {
      setStudentState('error');
    }
  }

  async function handleAcademySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAcademyState('loading');

    try {
      const result = await saveOrganization(academyForm);
      const id = result.id;
      const newOrganization: Organization = {
        id,
        name: academyForm.name,
        document: academyForm.document,
        businessType: academyForm.businessType,
        ownerName: academyForm.ownerName,
        email: academyForm.email,
        phone: academyForm.phone,
        city: academyForm.city,
        state: academyForm.state,
        units: academyForm.units,
        status: 'Implantacao',
      };
      const newLocation: Location = {
        id: `loc-${id}`,
        organizationId: id,
        name: 'Unidade principal',
        city: academyForm.city,
        state: academyForm.state,
      };

      setOrganizations((current) => [newOrganization, ...current]);
      setLocations((current) => [newLocation, ...current]);
      setSelectedOrganizationId(id);
      setStudentForm({ ...emptyStudent, organizationId: id, locationId: newLocation.id });
      setAcademyForm(emptyOrganization);
      setAcademyState('success');
      window.setTimeout(() => setAcademyState('idle'), 2600);
    } catch {
      setAcademyState('error');
    }
  }

  if (page === 'dashboard') {
    return (
      <Dashboard
        activeModule={activeModule}
        academyForm={academyForm}
        academyState={academyState}
        filteredStudents={filteredStudents}
        handleAcademySubmit={handleAcademySubmit}
        handleStudentSubmit={handleStudentSubmit}
        locations={locations}
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        selectedOrganizationId={selectedOrganizationId}
        setActiveModule={setActiveModule}
        setAcademyForm={setAcademyForm}
        setPage={setPage}
        setSelectedOrganizationId={setSelectedOrganizationId}
        setStudentForm={setStudentForm}
        setStudentSearch={setStudentSearch}
        studentForm={studentForm}
        studentSearch={studentSearch}
        studentState={studentState}
        students={students}
      />
    );
  }

  if (page === 'studentPortal') {
    return (
      <StudentPortal
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        setPage={setPage}
        students={students}
      />
    );
  }

  return (
    <div className="marketing-page">
      <header className="site-header">
        <div className="promo-bar">
          <span>Barra promocional responsiva</span>
          <strong>Diagnostico gratuito para negocios fitness</strong>
          <button onClick={() => scrollToSection('demo')}>Faça uma demonstração gratuita</button>
        </div>

        <nav className="nav-shell" aria-label="Navegacao principal">
          <button className="brand" onClick={() => scrollToSection('top')} aria-label="Ir para o inicio">
            <img src={logoUrl} alt="Xbelt" />
            <span>Xbelt</span>
          </button>

          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            <div className="modality-menu">
              <button onClick={() => setModalitiesOpen((value) => !value)}>
                Escolha sua modalidade
                <ChevronDown size={16} />
              </button>
              {modalitiesOpen && (
                <div className="modality-popover">
                  {modalities.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.title}
                        onClick={() => {
                          setModalitiesOpen(false);
                          scrollToSection('modalidades');
                        }}
                      >
                        <Icon size={18} />
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button onClick={() => scrollToSection('funcionalidades')}>Funcionalidades</button>
            <button onClick={() => scrollToSection('plataforma')}>Plataforma</button>
            <button onClick={() => scrollToSection('apps')}>Aplicativos</button>
            <button onClick={() => scrollToSection('planos')}>Planos</button>
            <button onClick={() => scrollToSection('educacao')}>Educacao</button>
            <button onClick={() => scrollToSection('faq')}>FAQ</button>
          </div>

          <div className="nav-actions">
            <button className="ghost-action" onClick={() => setPage('dashboard')}>
              Ja sou cliente
            </button>
            <button className="ghost-action" onClick={() => setPage('studentPortal')}>
              Portal do aluno
            </button>
            <button className="primary-action" onClick={() => scrollToSection('demo')}>
              Demonstração
            </button>
            <button
              className="icon-button mobile-only"
              aria-label="Abrir menu"
              title="Abrir menu"
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="eyebrow">
              <Sparkles size={16} />
              O sistema favorito dos gestores do segmento fitness
            </div>
            <h1>Xbelt</h1>
            <p className="hero-subtitle">
              Plataforma premium para academias, estudios, boxes, pilates, lutas e quadras
              venderem mais, reterem alunos e operarem com menos trabalho manual.
            </p>
            <div className="hero-actions">
              <button className="primary-action large" onClick={() => scrollToSection('demo')}>
                Faça uma demonstração gratuita
                <ArrowRight size={18} />
              </button>
              <button className="secondary-action large" onClick={() => setPage('dashboard')}>
                Painel de gestao
                <PlayCircle size={18} />
              </button>
              <button className="secondary-action large" onClick={() => setPage('studentPortal')}>
                Portal do aluno
                <Smartphone size={18} />
              </button>
            </div>
            <div className="hero-pills" aria-label="Diferenciais">
              {['Facil de utilizar', 'Completo', 'Moderno', 'Inovador', 'Melhor preco'].map((item) => (
                <span key={item}>
                  <CheckCircle2 size={15} />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="product-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            aria-label="Previa do painel Xbelt"
          >
            <div className="visual-toolbar">
              <span />
              <span />
              <span />
              <strong>Xbelt OS</strong>
            </div>
            <div className="visual-grid">
              <div className="visual-card wide">
                <div>
                  <small>Receita mensal</small>
                  <strong>R$ 134.200</strong>
                </div>
                <TrendingUp size={28} />
              </div>
              <div className="visual-card">
                <small>Check-ins</small>
                <strong>2.841</strong>
                <div className="mini-bars">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="visual-card">
                <small>Retencao</small>
                <strong>92%</strong>
                <div className="ring-chart" />
              </div>
              <div className="visual-panel">
                <div className="visual-row">
                  <BadgeCheck size={18} />
                  <span>Contrato Black Anual aprovado</span>
                </div>
                <div className="visual-row">
                  <CalendarDays size={18} />
                  <span>Funcional HIIT lotado as 18:00</span>
                </div>
                <div className="visual-row">
                  <CreditCard size={18} />
                  <span>PIX recebido de Rafael Siqueira</span>
                </div>
              </div>
            </div>
            <div className="phone-preview">
              <div className="phone-notch" />
              <img src={logoUrl} alt="" />
              <strong>App do aluno</strong>
              <span>Treino A liberado</span>
              <button>Agendar aula</button>
            </div>
          </motion.div>
        </section>

        <section className="stats-band" aria-label="Indicadores">
          <div className="section-kicker">Negocios fitness crescendo com operacao orientada por dados</div>
          <div className="stats-grid">
            {growthStats.map((stat) => (
              <article key={stat.value} className="stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="modalidades">
          <SectionHeader
            eyebrow="Escolha sua modalidade"
            title="Um sistema para cada rotina fitness"
            text="A mesma base de gestao se adapta ao jeito que sua operacao vende, agenda, atende e acompanha alunos."
          />
          <div className="modality-grid">
            {modalities.map((item) => {
              const Icon = item.icon;
              return (
                <article className="modality-card" key={item.title}>
                  <Icon size={24} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section platform-section" id="plataforma">
          <SectionHeader
            eyebrow="Plataforma completa"
            title="Do cadastro da academia ao portal do aluno"
            text="O Xbelt organiza a empresa, as unidades, a equipe e cada aluno dentro da academia correta. O gestor enxerga a operacao; o aluno acessa somente a jornada dele."
          />
          <div className="platform-grid">
            {platformModules.map((module) => {
              const Icon = module.icon;
              return (
                <article className="platform-card" key={module.title}>
                  <Icon size={22} />
                  <h3>{module.title}</h3>
                  <p>{module.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section flow-section">
          <SectionHeader
            eyebrow="Como a operacao fica estruturada"
            title="Academia, unidade e aluno com relacionamento claro"
            text="A plataforma nao trata aluno solto. Todo cadastro pertence a uma organizacao, a uma unidade e a um contrato, permitindo multiunidade e expansao."
          />
          <div className="flow-layout">
            <div className="flow-diagram" aria-label="Fluxo de cadastro">
              <div>
                <Building2 size={26} />
                <strong>Academia</strong>
                <span>dados fiscais, dono e unidades</span>
              </div>
              <ArrowRight size={24} />
              <div>
                <Users size={26} />
                <strong>Aluno</strong>
                <span>plano, contrato e unidade</span>
              </div>
              <ArrowRight size={24} />
              <div>
                <Smartphone size={26} />
                <strong>Portal</strong>
                <span>treino, agenda e pagamentos</span>
              </div>
            </div>
            <div className="flow-steps">
              {operatingFlow.map((step) => (
                <article key={step.title}>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section education-section" id="educacao">
          <SectionHeader
            eyebrow="Muito alem da tecnologia"
            title="Conteudo, mentoria e treinamento para sua equipe executar melhor"
            text="O Xbelt combina software com playbooks operacionais para gestores, recepcionistas e instrutores evoluirem a rotina."
          />
          <div className="education-grid">
            {educationCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="education-card" key={card.title}>
                  <span>{card.eyebrow}</span>
                  <Icon size={28} />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <button>
                    {card.action}
                    <ArrowRight size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section feature-section" id="funcionalidades">
          <SectionHeader
            eyebrow="Completo por design"
            title="Funcionalidades para vender, operar, treinar e reter"
            text="Fluxos essenciais do negocio fitness conectados em uma interface simples para a equipe usar todos os dias."
          />
          <div className="feature-tabs" role="tablist" aria-label="Funcionalidades">
            {featureTabs.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={activeFeature === item.key ? 'active' : ''}
                  key={item.key}
                  onClick={() => setActiveFeature(item.key)}
                  role="tab"
                  aria-selected={activeFeature === item.key}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <article className="feature-showcase">
            <div>
              <div className="feature-icon">
                <SelectedFeatureIcon size={28} />
              </div>
              <h3>{selectedFeature.title}</h3>
              <p>{selectedFeature.text}</p>
              <ul>
                {selectedFeature.bullets.map((bullet) => (
                  <li key={bullet}>
                    <CheckCircle2 size={18} />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="feature-dashboard">
              <span>{selectedFeature.stats}</span>
              <div className="dashboard-line" />
              <div className="dashboard-list">
                <div>
                  <strong>92%</strong>
                  <small>retencao</small>
                </div>
                <div>
                  <strong>R$ 134k</strong>
                  <small>receita</small>
                </div>
                <div>
                  <strong>27</strong>
                  <small>acoes hoje</small>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="apps-section" id="apps">
          <SectionHeader
            eyebrow="Aplicativo para voce e seus alunos"
            title="Duas experiencias conectadas ao mesmo negocio"
            text="Aluno acompanha a propria jornada. Gestor e instrutores resolvem a operacao na palma da mao."
          />
          <div className="apps-grid">
            <AppCard
              badge="Xbelt App"
              title="Para seus alunos"
              icon={Smartphone}
              benefits={studentBenefits}
            />
            <AppCard
              badge="Xbelt Pro"
              title="Para gestores e instrutores"
              icon={ShieldCheck}
              benefits={proBenefits}
            />
          </div>
        </section>

        <section className="section pricing-section" id="planos">
          <SectionHeader
            eyebrow="Planos comerciais"
            title="Precificacao preparada para crescer com a operacao"
            text="Modelos para estudio pequeno, academia em escala e redes multiunidade. Os valores sao demonstrativos e podem ser ajustados no painel."
          />
          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article className="pricing-card" key={plan.name}>
                <span>{plan.name}</span>
                <strong>{plan.price}</strong>
                <p>{plan.text}</p>
                <ul>
                  {plan.items.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => scrollToSection('demo')}>Solicitar proposta</button>
              </article>
            ))}
          </div>
        </section>

        <section className="support-band">
          <div>
            <span className="section-kicker">Suporte humanizado</span>
            <h2>Atendimento que resolve a operacao de verdade</h2>
            <p>
              Chat, videochamada, base de conhecimento, tarefas internas e historico do cliente para
              cada duvida virar processo resolvido.
            </p>
          </div>
          <div className="support-cards">
            <article>
              <Clock3 size={24} />
              <strong>&lt; 10 min</strong>
              <span>tempo alvo de primeira resposta</span>
            </article>
            <article>
              <Headphones size={24} />
              <strong>Especialistas</strong>
              <span>treinamento e sucesso do cliente</span>
            </article>
            <article>
              <LockKeyhole size={24} />
              <strong>Seguro</strong>
              <span>perfis, permissoes e trilha de auditoria</span>
            </article>
          </div>
        </section>

        <section className="section">
          <SectionHeader
            eyebrow="O que clientes esperam"
            title="Muito mais que um sistema"
            text="Depois de anos observando academias, estudios e boxes, o Xbelt foi desenhado para reduzir trabalho repetitivo e aumentar qualidade de atendimento."
          />
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.author}>
                <div className="stars" aria-label="5 estrelas">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>{testimonial.quote}</p>
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="demo-section" id="demo">
          <div className="demo-copy">
            <span className="section-kicker">Fale com nossos consultores</span>
            <h2>Descubra como o Xbelt pode ajudar seu negocio a conquistar mais alunos</h2>
            <p>
              Preencha os dados para simular uma demonstracao. Com Supabase configurado, os leads
              entram direto na tabela <code>demo_leads</code>.
            </p>
            <div className="demo-checks">
              <span>
                <CheckCircle2 size={18} />
                Diagnostico de vendas e retencao
              </span>
              <span>
                <CheckCircle2 size={18} />
                Mapa de funcionalidades por modalidade
              </span>
              <span>
                <CheckCircle2 size={18} />
                Plano de implantacao para Vercel + Supabase
              </span>
            </div>
          </div>
          <form className="demo-form" onSubmit={handleLeadSubmit}>
            <label>
              Nome
              <input
                required
                value={lead.name}
                onChange={(event) => setLead({ ...lead, name: event.target.value })}
                placeholder="Seu nome"
              />
            </label>
            <label>
              E-mail
              <input
                required
                type="email"
                value={lead.email}
                onChange={(event) => setLead({ ...lead, email: event.target.value })}
                placeholder="voce@empresa.com"
              />
            </label>
            <label>
              Celular
              <input
                required
                value={lead.phone}
                onChange={(event) => setLead({ ...lead, phone: event.target.value })}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              Qual o seu modelo de negocio?
              <select
                value={lead.businessType}
                onChange={(event) => setLead({ ...lead, businessType: event.target.value })}
              >
                <option>Academia</option>
                <option>Estudio</option>
                <option>Box</option>
                <option>Academia de artes marciais</option>
                <option>Quadra esportiva</option>
                <option>Escola de esportes</option>
                <option>Pilates</option>
                <option>Outro</option>
              </select>
            </label>
            <label>
              Tamanho da operacao
              <select
                value={lead.teamSize}
                onChange={(event) => setLead({ ...lead, teamSize: event.target.value })}
              >
                <option>1 unidade</option>
                <option>2 a 5 unidades</option>
                <option>6 a 20 unidades</option>
                <option>Rede nacional</option>
              </select>
            </label>
            <label className="full">
              O que voce quer melhorar primeiro?
              <textarea
                value={lead.message}
                onChange={(event) => setLead({ ...lead, message: event.target.value })}
                placeholder="Ex.: financeiro, agenda, treinos, vendas online..."
              />
            </label>
            <button className="primary-action large full" disabled={leadState === 'loading'}>
              {leadState === 'loading' ? 'Enviando...' : 'Faça uma demonstração gratuita'}
            </button>
            {leadMessage && <p className={`form-message ${leadState}`}>{leadMessage}</p>}
          </form>
        </section>

        <section className="section faq-section" id="faq">
          <SectionHeader
            eyebrow="Perguntas frequentes"
            title="Tire suas duvidas sobre o sistema"
            text="Respostas rapidas para publicar, conectar o banco e evoluir o produto."
          />
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <article className="faq-item" key={faq.question}>
                <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  {faq.question}
                  <ChevronDown size={18} />
                </button>
                {openFaq === index && <p>{faq.answer}</p>}
              </article>
            ))}
          </div>
        </section>
      </main>

      <button className="chat-bubble" onClick={() => scrollToSection('demo')} aria-label="Abrir conversa">
        <MessageCircle size={22} />
        <span>Ola! Deseja fazer uma demonstracao online?</span>
      </button>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="section-header">
      <span className="section-kicker">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function AppCard({
  badge,
  title,
  icon: Icon,
  benefits,
}: {
  badge: string;
  title: string;
  icon: LucideIcon;
  benefits: string[];
}) {
  return (
    <article className="mobile-app-card">
      <div className="app-phone">
        <div className="phone-notch" />
        <Icon size={32} />
        <strong>{badge}</strong>
        <span>{title}</span>
        <div className="app-progress">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div>
        <span className="section-kicker">{badge}</span>
        <h3>{title}</h3>
        <ul>
          {benefits.map((benefit) => (
            <li key={benefit}>
              <CheckCircle2 size={18} />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Dashboard({
  activeModule,
  academyForm,
  academyState,
  filteredStudents,
  handleAcademySubmit,
  handleStudentSubmit,
  locations,
  organizations,
  selectedOrganization,
  selectedOrganizationId,
  setActiveModule,
  setAcademyForm,
  setPage,
  setSelectedOrganizationId,
  setStudentForm,
  setStudentSearch,
  studentForm,
  studentSearch,
  studentState,
  students,
}: {
  activeModule: ModuleKey;
  academyForm: OrganizationPayload;
  academyState: 'idle' | 'loading' | 'success' | 'error';
  filteredStudents: Student[];
  handleAcademySubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleStudentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  locations: Location[];
  organizations: Organization[];
  selectedOrganization: Organization;
  selectedOrganizationId: string;
  setActiveModule: (module: ModuleKey) => void;
  setAcademyForm: (academy: OrganizationPayload) => void;
  setPage: (page: Page) => void;
  setSelectedOrganizationId: (id: string) => void;
  setStudentForm: (student: StudentPayload) => void;
  setStudentSearch: (query: string) => void;
  studentForm: StudentPayload;
  studentSearch: string;
  studentState: 'idle' | 'loading' | 'success' | 'error';
  students: Student[];
}) {
  const ActiveIcon = modules.find((item) => item.key === activeModule)?.icon ?? LayoutDashboard;

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <button className="brand dashboard-brand" onClick={() => setPage('marketing')}>
          <img src={logoUrl} alt="Xbelt" />
          <span>Xbelt</span>
        </button>
        <div className="workspace-switcher">
          <Building2 size={18} />
          <div>
            <strong>{selectedOrganization.name}</strong>
            <span>
              {selectedOrganization.businessType} · {selectedOrganization.status}
            </span>
          </div>
        </div>
        <label className="sidebar-select">
          Operacao
          <select
            value={selectedOrganizationId}
            onChange={(event) => setSelectedOrganizationId(event.target.value)}
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Modulos do painel">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                className={activeModule === module.key ? 'active' : ''}
                key={module.key}
                onClick={() => setActiveModule(module.key)}
              >
                <Icon size={18} />
                {module.label}
              </button>
            );
          })}
        </nav>
        <button className="secondary-action" onClick={() => setPage('marketing')}>
          Voltar ao site
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="section-kicker">Painel Xbelt</span>
            <h1>
              <ActiveIcon size={28} />
              {modules.find((item) => item.key === activeModule)?.label}
            </h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" title="Pesquisar" aria-label="Pesquisar">
              <Search size={18} />
            </button>
            <button className="icon-button" title="Notificacoes" aria-label="Notificacoes">
              <Bell size={18} />
            </button>
            <button className="primary-action" onClick={() => setActiveModule('students')}>
              <UserPlus size={17} />
              Novo aluno
            </button>
            <button className="secondary-action" onClick={() => setPage('studentPortal')}>
              <Smartphone size={17} />
              Portal do aluno
            </button>
          </div>
        </header>

        {activeModule === 'overview' && (
          <Overview selectedOrganization={selectedOrganization} students={filteredStudents} />
        )}
        {activeModule === 'academy' && (
          <AcademyModule
            academyForm={academyForm}
            academyState={academyState}
            handleAcademySubmit={handleAcademySubmit}
            locations={locations}
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            setAcademyForm={setAcademyForm}
          />
        )}
        {activeModule === 'students' && (
          <StudentsModule
            filteredStudents={filteredStudents}
            handleStudentSubmit={handleStudentSubmit}
            locations={locations}
            organizations={organizations}
            selectedOrganizationId={selectedOrganizationId}
            setStudentForm={setStudentForm}
            setStudentSearch={setStudentSearch}
            studentForm={studentForm}
            studentSearch={studentSearch}
            studentState={studentState}
          />
        )}
        {activeModule === 'schedule' && <ScheduleModule />}
        {activeModule === 'finance' && <FinanceModule />}
        {activeModule === 'workouts' && <WorkoutsModule />}
        {activeModule === 'assessments' && <AssessmentsModule />}
        {activeModule === 'contracts' && <ContractsModule />}
        {activeModule === 'sales' && <SalesModule />}
        {activeModule === 'relationship' && <RelationshipModule />}
        {activeModule === 'reports' && <ReportsModule />}
        {activeModule === 'settings' && <SettingsModule />}
      </section>
    </div>
  );
}

function Overview({
  selectedOrganization,
  students,
}: {
  selectedOrganization: Organization;
  students: Student[];
}) {
  return (
    <div className="dashboard-content">
      <article className="panel academy-summary">
        <div>
          <span className="section-kicker">Operacao selecionada</span>
          <h2>{selectedOrganization.name}</h2>
          <p>
            {selectedOrganization.businessType} em {selectedOrganization.city}/{selectedOrganization.state}
            com {students.length} alunos neste ambiente. Todos os indicadores abaixo estao filtrados por
            esta academia.
          </p>
        </div>
        <button>Configurar academia</button>
      </article>
      <div className="metric-grid">
        <MetricCard icon={Users} label="Alunos da academia" value={`${students.length}`} change="+12,4%" />
        <MetricCard icon={CircleDollarSign} label="Receita mensal" value="R$ 134.200" change="+18,7%" />
        <MetricCard icon={CalendarDays} label="Aulas hoje" value="48" change="92% ocupacao" />
        <MetricCard icon={Activity} label="Retencao" value="92%" change="+4,1%" />
      </div>

      <div className="dashboard-grid two-columns">
        <article className="panel large-panel">
          <PanelHeader icon={LineChart} title="Receita e recorrencia" action="Exportar" />
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="receita" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#e03131" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#e03131" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="#e03131"
                  strokeWidth={3}
                  fill="url(#receita)"
                />
                <Area type="monotone" dataKey="recorrencia" stroke="#16a085" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <PanelHeader icon={ShieldCheck} title="Saude da base" action="Ver alunos" />
          <div className="chart-wrap compact">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={retentionData} dataKey="value" innerRadius={56} outerRadius={82} paddingAngle={4}>
                  {retentionData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-list">
            {retentionData.map((item) => (
              <span key={item.name}>
                <i style={{ background: item.color }} />
                {item.name} {item.value}%
              </span>
            ))}
          </div>
        </article>
      </div>

      <div className="dashboard-grid two-columns">
        <article className="panel">
          <PanelHeader icon={CalendarCheck} title="Agenda de hoje" action="Gerenciar" />
          <div className="schedule-list">
            {classSchedule.slice(0, 4).map((item) => (
              <div className="schedule-row" key={`${item.time}-${item.className}`}>
                <strong>{item.time}</strong>
                <div>
                  <span>{item.className}</span>
                  <small>
                    {item.coach} · {item.room}
                  </small>
                </div>
                <em>{item.spots}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <PanelHeader icon={Users} title="Alunos que precisam de acao" action="Abrir CRM" />
          <div className="student-alert-list">
            {students.map((student) => (
              <div key={student.email}>
                <span className={`status-dot ${student.status.toLowerCase().replace(' ', '-')}`} />
                <div>
                  <strong>{student.name}</strong>
                  <small>
                    {student.status} · {student.plan} · {student.nextClass}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function AcademyModule({
  academyForm,
  academyState,
  handleAcademySubmit,
  locations,
  organizations,
  selectedOrganization,
  setAcademyForm,
}: {
  academyForm: OrganizationPayload;
  academyState: 'idle' | 'loading' | 'success' | 'error';
  handleAcademySubmit: (event: FormEvent<HTMLFormElement>) => void;
  locations: Location[];
  organizations: Organization[];
  selectedOrganization: Organization;
  setAcademyForm: (academy: OrganizationPayload) => void;
}) {
  const organizationLocations = locations.filter(
    (location) => location.organizationId === selectedOrganization.id,
  );

  return (
    <div className="dashboard-content">
      <div className="dashboard-grid form-grid">
        <article className="panel">
          <PanelHeader icon={Building2} title="Cadastrar academia" action="Organizacao" />
          <form className="student-form" onSubmit={handleAcademySubmit}>
            <label>
              Nome da academia
              <input
                required
                value={academyForm.name}
                onChange={(event) => setAcademyForm({ ...academyForm, name: event.target.value })}
                placeholder="Ex.: Xbelt Fitness Jardins"
              />
            </label>
            <label>
              CNPJ ou documento
              <input
                required
                value={academyForm.document}
                onChange={(event) => setAcademyForm({ ...academyForm, document: event.target.value })}
                placeholder="00.000.000/0001-00"
              />
            </label>
            <label>
              Modalidade principal
              <select
                value={academyForm.businessType}
                onChange={(event) =>
                  setAcademyForm({ ...academyForm, businessType: event.target.value })
                }
              >
                <option>Academia</option>
                <option>Estudio</option>
                <option>Box</option>
                <option>Pilates</option>
                <option>Lutas</option>
                <option>Quadras</option>
                <option>Escola de esportes</option>
              </select>
            </label>
            <label>
              Responsavel
              <input
                required
                value={academyForm.ownerName}
                onChange={(event) =>
                  setAcademyForm({ ...academyForm, ownerName: event.target.value })
                }
                placeholder="Nome do gestor"
              />
            </label>
            <label>
              E-mail
              <input
                required
                type="email"
                value={academyForm.email}
                onChange={(event) => setAcademyForm({ ...academyForm, email: event.target.value })}
                placeholder="gestor@academia.com"
              />
            </label>
            <label>
              Celular
              <input
                required
                value={academyForm.phone}
                onChange={(event) => setAcademyForm({ ...academyForm, phone: event.target.value })}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              Cidade
              <input
                required
                value={academyForm.city}
                onChange={(event) => setAcademyForm({ ...academyForm, city: event.target.value })}
                placeholder="Cidade"
              />
            </label>
            <label>
              Estado
              <input
                required
                value={academyForm.state}
                onChange={(event) => setAcademyForm({ ...academyForm, state: event.target.value })}
                placeholder="UF"
                maxLength={2}
              />
            </label>
            <label>
              Quantidade de unidades
              <select
                value={academyForm.units}
                onChange={(event) => setAcademyForm({ ...academyForm, units: event.target.value })}
              >
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>10</option>
              </select>
            </label>
            <button className="primary-action" disabled={academyState === 'loading'}>
              {academyState === 'loading' ? 'Salvando...' : 'Cadastrar academia'}
            </button>
            {academyState === 'success' && (
              <p className="form-message success">Academia criada e selecionada.</p>
            )}
            {academyState === 'error' && (
              <p className="form-message error">Nao foi possivel salvar a academia.</p>
            )}
          </form>
        </article>

        <article className="panel">
          <PanelHeader icon={Building2} title="Academia selecionada" action={selectedOrganization.status} />
          <div className="academy-profile">
            <div>
              <strong>{selectedOrganization.name}</strong>
              <span>{selectedOrganization.document}</span>
            </div>
            <div>
              <strong>{selectedOrganization.ownerName}</strong>
              <span>{selectedOrganization.email}</span>
            </div>
            <div>
              <strong>{selectedOrganization.businessType}</strong>
              <span>
                {selectedOrganization.city}/{selectedOrganization.state} · {selectedOrganization.units} unidade(s)
              </span>
            </div>
          </div>

          <div className="organization-grid">
            {organizations.map((organization) => (
              <article key={organization.id}>
                <Building2 size={20} />
                <strong>{organization.name}</strong>
                <span>
                  {organization.businessType} · {organization.status}
                </span>
              </article>
            ))}
          </div>

          <PanelHeader icon={CalendarCheck} title="Unidades vinculadas" action={`${organizationLocations.length}`} />
          <div className="unit-list">
            {organizationLocations.map((location) => (
              <div key={location.id}>
                <strong>{location.name}</strong>
                <span>
                  {location.city}/{location.state}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function StudentsModule({
  filteredStudents,
  handleStudentSubmit,
  locations,
  organizations,
  selectedOrganizationId,
  setStudentForm,
  setStudentSearch,
  studentForm,
  studentSearch,
  studentState,
}: {
  filteredStudents: Student[];
  handleStudentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  locations: Location[];
  organizations: Organization[];
  selectedOrganizationId: string;
  setStudentForm: (student: StudentPayload) => void;
  setStudentSearch: (query: string) => void;
  studentForm: StudentPayload;
  studentSearch: string;
  studentState: 'idle' | 'loading' | 'success' | 'error';
}) {
  const formOrganizationId = studentForm.organizationId ?? selectedOrganizationId;
  const formLocations = locations.filter((location) => location.organizationId === formOrganizationId);

  return (
    <div className="dashboard-content">
      <div className="dashboard-grid form-grid">
        <article className="panel">
          <PanelHeader icon={UserPlus} title="Cadastrar aluno" action="Supabase ready" />
          <form className="student-form" onSubmit={handleStudentSubmit}>
            <label>
              Academia
              <select
                value={formOrganizationId}
                onChange={(event) => {
                  const firstLocation = locations.find(
                    (location) => location.organizationId === event.target.value,
                  );
                  setStudentForm({
                    ...studentForm,
                    organizationId: event.target.value,
                    locationId: firstLocation?.id ?? '',
                  });
                }}
              >
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Unidade
              <select
                value={studentForm.locationId ?? formLocations[0]?.id ?? ''}
                onChange={(event) => setStudentForm({ ...studentForm, locationId: event.target.value })}
              >
                {formLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nome
              <input
                required
                value={studentForm.name}
                onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })}
                placeholder="Nome completo"
              />
            </label>
            <label>
              E-mail
              <input
                required
                type="email"
                value={studentForm.email}
                onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })}
                placeholder="aluno@email.com"
              />
            </label>
            <label>
              Celular
              <input
                required
                value={studentForm.phone}
                onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              Objetivo
              <select
                value={studentForm.goal}
                onChange={(event) => setStudentForm({ ...studentForm, goal: event.target.value })}
              >
                <option>Condicionamento</option>
                <option>Hipertrofia</option>
                <option>Perda de peso</option>
                <option>Mobilidade</option>
                <option>Performance</option>
                <option>Reabilitacao</option>
              </select>
            </label>
            <label>
              Plano
              <select
                value={studentForm.plan}
                onChange={(event) => setStudentForm({ ...studentForm, plan: event.target.value })}
              >
                {contractPlans.map((plan) => (
                  <option key={plan.name}>{plan.name}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={studentForm.status}
                onChange={(event) => setStudentForm({ ...studentForm, status: event.target.value })}
              >
                <option>Ativo</option>
                <option>A vencer</option>
                <option>Trial</option>
                <option>Inadimplente</option>
              </select>
            </label>
            <button className="primary-action" disabled={studentState === 'loading'}>
              {studentState === 'loading' ? 'Salvando...' : 'Adicionar aluno'}
            </button>
            {studentState === 'success' && <p className="form-message success">Aluno adicionado.</p>}
            {studentState === 'error' && (
              <p className="form-message error">Nao foi possivel salvar no Supabase.</p>
            )}
          </form>
        </article>

        <article className="panel table-panel">
          <PanelHeader icon={Users} title="Base de alunos" action={`${filteredStudents.length} registros`} />
          <label className="search-field">
            <Search size={18} />
            <input
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder="Buscar por nome, plano, objetivo ou status"
            />
          </label>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Academia</th>
                  <th>Plano</th>
                  <th>Objetivo</th>
                  <th>Status</th>
                  <th>Check-ins</th>
                  <th>Receita</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.email}>
                    <td>
                      <strong>{student.name}</strong>
                      <span>{student.email}</span>
                    </td>
                    <td>{student.organizationName}</td>
                    <td>{student.plan}</td>
                    <td>{student.goal}</td>
                    <td>
                      <span className={`status-pill ${student.status.toLowerCase().replace(' ', '-')}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>{student.checkins}</td>
                    <td>{student.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  );
}

function ScheduleModule() {
  return (
    <div className="dashboard-content">
      <div className="metric-grid">
        <MetricCard icon={CalendarDays} label="Aulas hoje" value="48" change="5 salas ativas" />
        <MetricCard icon={Users} label="Ocupacao media" value="87%" change="+6%" />
        <MetricCard icon={Clock3} label="Lista de espera" value="31" change="12 encaixes" />
        <MetricCard icon={Bell} label="Lembretes enviados" value="412" change="SMS + WhatsApp" />
      </div>
      <article className="panel">
        <PanelHeader icon={CalendarCheck} title="Grade operacional" action="Criar aula" />
        <div className="schedule-board">
          {classSchedule.map((item) => (
            <div className="schedule-card" key={`${item.time}-${item.className}`}>
              <strong>{item.time}</strong>
              <h3>{item.className}</h3>
              <p>
                {item.coach} · {item.room}
              </p>
              <span>{item.spots} vagas</span>
              <button>Gerenciar</button>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function FinanceModule() {
  return (
    <div className="dashboard-content">
      <div className="metric-grid">
        <MetricCard icon={WalletCards} label="Recebido" value="R$ 134.200" change="+18,7%" />
        <MetricCard icon={Receipt} label="Em aberto" value="R$ 18.920" change="72 faturas" />
        <MetricCard icon={CreditCard} label="Recorrencia" value="78%" change="cartao + PIX" />
        <MetricCard icon={CircleDollarSign} label="Inadimplencia" value="3,8%" change="-1,2%" />
      </div>
      <div className="dashboard-grid two-columns">
        <article className="panel large-panel">
          <PanelHeader icon={BarChart3} title="Composicao da receita" action="DRE" />
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="recorrencia" stackId="a" fill="#16a085" radius={[6, 6, 0, 0]} />
                <Bar dataKey="vendas" stackId="a" fill="#e03131" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="panel">
          <PanelHeader icon={Receipt} title="Ultimas faturas" action="Cobrar" />
          <div className="invoice-list">
            {invoices.map((invoice) => (
              <div key={invoice.id}>
                <strong>{invoice.client}</strong>
                <span>
                  {invoice.id} · {invoice.method}
                </span>
                <em className={invoice.status.toLowerCase()}>{invoice.status}</em>
                <b>{invoice.amount}</b>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function WorkoutsModule() {
  return (
    <div className="dashboard-content">
      <div className="metric-grid">
        <MetricCard icon={Dumbbell} label="Treinos ativos" value="312" change="84 modelos" />
        <MetricCard icon={Activity} label="Evolucoes registradas" value="9.840" change="+22%" />
        <MetricCard icon={PlayCircle} label="Videos prescritos" value="1.426" change="biblioteca" />
        <MetricCard icon={Users} label="Feedbacks de esforco" value="684" change="RPE semanal" />
      </div>
      <div className="workout-grid">
        {workouts.map((workout) => (
          <article className="panel workout-card" key={workout.title}>
            <PanelHeader icon={Dumbbell} title={workout.title} action={workout.updated} />
            <p>{workout.focus}</p>
            <strong>{workout.students} alunos</strong>
            <div className="exercise-stack">
              <span>Supino inclinado · 4x10</span>
              <span>Agachamento livre · 5x5</span>
              <span>Remada baixa · 3x12</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AssessmentsModule() {
  return (
    <div className="dashboard-content">
      <div className="assessment-grid">
        {assessments.map((assessment) => (
          <article className={`panel assessment-card ${assessment.tone}`} key={assessment.metric}>
            <span>{assessment.metric}</span>
            <strong>{assessment.current}</strong>
            <em>{assessment.change}</em>
          </article>
        ))}
      </div>
      <article className="panel">
        <PanelHeader icon={ClipboardCheck} title="Fila de avaliacoes fisicas" action="Agendar" />
        <div className="timeline">
          {['Bioimpedancia vencendo', 'Reavaliacao pos 30 dias', 'Fotos comparativas', 'Anamnese incompleta'].map(
            (item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item}</strong>
                  <p>{12 + index * 5} alunos precisam de acompanhamento.</p>
                </div>
              </div>
            ),
          )}
        </div>
      </article>
    </div>
  );
}

function ContractsModule() {
  return (
    <div className="dashboard-content">
      <div className="plans-grid">
        {contractPlans.map((plan) => (
          <article className="panel plan-card" key={plan.name}>
            <span>Plano</span>
            <h3>{plan.name}</h3>
            <strong>{plan.price}</strong>
            <p>{plan.benefit}</p>
            <em>{plan.contracts} contratos ativos</em>
            <button>Editar contrato</button>
          </article>
        ))}
      </div>
      <article className="panel">
        <PanelHeader icon={FileText} title="Automacoes de contrato" action="Nova regra" />
        <div className="automation-list">
          {[
            'Enviar contrato digital apos venda aprovada',
            'Avisar consultor 10 dias antes do vencimento',
            'Tentar cobranca recorrente em 3 janelas',
            'Gerar tarefa de retencao para contrato cancelado',
          ].map((item) => (
            <span key={item}>
              <Zap size={17} />
              {item}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}

function SalesModule() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-grid two-columns">
        <article className="panel large-panel">
          <PanelHeader icon={ShoppingCart} title="Funil de vendas" action="Publicar pagina" />
          <div className="pipeline">
            {salesPipeline.map((stage) => (
              <div key={stage.stage}>
                <strong>{stage.count}</strong>
                <span>{stage.stage}</span>
                <em>{stage.amount}</em>
              </div>
            ))}
          </div>
        </article>
        <article className="panel sales-site-card">
          <PanelHeader icon={Sparkles} title="Site de vendas" action="Online" />
          <h3>Planos, produtos e aulas experimentais</h3>
          <p>
            Monte paginas por modalidade, conecte checkout e acompanhe origem do lead ate o contrato.
          </p>
          <button className="primary-action">Configurar checkout</button>
        </article>
      </div>
    </div>
  );
}

function RelationshipModule() {
  return (
    <div className="dashboard-content">
      <div className="metric-grid">
        <MetricCard icon={MessageCircle} label="Conversas abertas" value="128" change="WhatsApp + app" />
        <MetricCard icon={Megaphone} label="Campanhas ativas" value="9" change="3 segmentadas" />
        <MetricCard icon={Users} label="Alunos em risco" value="47" change="sem check-in" />
        <MetricCard icon={Star} label="NPS" value="74" change="+8 pontos" />
      </div>
      <article className="panel">
        <PanelHeader icon={Megaphone} title="Segmentos inteligentes" action="Nova campanha" />
        <div className="segment-grid">
          {[
            'Aniversariantes da semana',
            'Sem check-in ha 14 dias',
            'Trial sem compra',
            'Contrato anual a vencer',
            'Alunos com treino sem feedback',
            'Leads de aula experimental',
          ].map((segment) => (
            <button key={segment}>{segment}</button>
          ))}
        </div>
      </article>
    </div>
  );
}

function ReportsModule() {
  return (
    <div className="dashboard-content">
      <div className="reports-grid">
        {reports.map((report) => (
          <article className="panel report-card" key={report.title}>
            <FileText size={24} />
            <h3>{report.title}</h3>
            <p>{report.text}</p>
            <button>Gerar relatorio</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function SettingsModule() {
  return (
    <div className="dashboard-content">
      <article className="panel settings-panel">
        <PanelHeader icon={Settings} title="Banco de dados Supabase" action={isSupabaseConfigured ? 'Conectado' : 'Demo'} />
        <div className={`connection-status ${isSupabaseConfigured ? 'connected' : 'offline'}`}>
          <ShieldCheck size={28} />
          <div>
            <strong>{isSupabaseConfigured ? 'Supabase configurado' : 'Modo demonstracao local'}</strong>
            <p>
              {isSupabaseConfigured
                ? 'As insercoes de leads e alunos ja usam o cliente Supabase.'
                : 'Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para persistir dados.'}
            </p>
          </div>
        </div>
        <div className="schema-list">
          {[
            'demo_leads',
            'students',
            'membership_plans',
            'contracts',
            'invoices',
            'class_sessions',
            'workout_templates',
            'physical_assessments',
            'support_tickets',
          ].map((table) => (
            <span key={table}>
              <CheckCircle2 size={16} />
              {table}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}

function StudentPortal({
  organizations,
  selectedOrganization,
  setPage,
  students,
}: {
  organizations: Organization[];
  selectedOrganization: Organization;
  setPage: (page: Page) => void;
  students: Student[];
}) {
  const organizationStudents = students.filter(
    (student) => student.organizationId === selectedOrganization.id,
  );
  const [selectedEmail, setSelectedEmail] = useState(
    organizationStudents[0]?.email ?? students[0]?.email ?? '',
  );
  const selectedStudent =
    students.find((student) => student.email === selectedEmail) ?? organizationStudents[0] ?? students[0];
  const studentOrganization =
    organizations.find((organization) => organization.id === selectedStudent.organizationId) ??
    selectedOrganization;
  const portalNav: { label: string; icon: LucideIcon }[] = [
    { label: 'Resumo', icon: LayoutDashboard },
    { label: 'Treino', icon: Dumbbell },
    { label: 'Agenda', icon: CalendarDays },
    { label: 'Financeiro', icon: WalletCards },
    { label: 'Avaliacoes', icon: ClipboardCheck },
    { label: 'Comunicados', icon: MessageCircle },
  ];

  return (
    <div className="student-portal">
      <aside className="student-sidebar">
        <button className="brand dashboard-brand" onClick={() => setPage('marketing')}>
          <img src={logoUrl} alt="Xbelt" />
          <span>Xbelt Aluno</span>
        </button>
        <div className="student-identity">
          <div className="student-avatar">{selectedStudent.name.slice(0, 1)}</div>
          <strong>{selectedStudent.name}</strong>
          <span>{studentOrganization.name}</span>
        </div>
        <label className="sidebar-select">
          Ver como aluno
          <select value={selectedEmail} onChange={(event) => setSelectedEmail(event.target.value)}>
            {students.map((student) => (
              <option key={student.email} value={student.email}>
                {student.name} · {student.organizationName}
              </option>
            ))}
          </select>
        </label>
        <nav>
          {portalNav.map(({ label, icon: PortalIcon }) => {
            return (
              <button key={label}>
                <PortalIcon size={18} />
                {label}
              </button>
            );
          })}
        </nav>
        <button className="secondary-action" onClick={() => setPage('dashboard')}>
          Voltar ao painel
        </button>
      </aside>

      <main className="student-main">
        <header className="student-hero">
          <div>
            <span className="section-kicker">Portal do aluno</span>
            <h1>{selectedStudent.name}</h1>
            <p>
              Vinculado a {studentOrganization.name} · {selectedStudent.plan} · objetivo{' '}
              {selectedStudent.goal}
            </p>
          </div>
          <button className="primary-action">
            <QrCodeIcon />
            Check-in
          </button>
        </header>

        <section className="student-metrics">
          <MetricCard icon={BadgeCheck} label="Plano ativo" value={selectedStudent.plan} change={selectedStudent.status} />
          <MetricCard icon={CalendarCheck} label="Proxima aula" value={selectedStudent.nextClass} change="confirmada" />
          <MetricCard icon={Dumbbell} label="Treinos feitos" value={`${selectedStudent.checkins}`} change="+3 semana" />
          <MetricCard icon={WalletCards} label="Financeiro" value={selectedStudent.revenue} change="historico" />
        </section>

        <section className="student-grid">
          <article className="panel student-workout">
            <PanelHeader icon={Dumbbell} title="Treino atual" action="Abrir app" />
            <h2>{selectedStudent.goal === 'Hipertrofia' ? 'Hipertrofia A' : 'Performance base'}</h2>
            <p>
              O instrutor liberou a rotina da semana com controle de carga, descanso e registro de onde
              parou.
            </p>
            <div className="exercise-stack">
              <span>Agachamento livre · 5x5 · 90s</span>
              <span>Supino inclinado · 4x10 · 75s</span>
              <span>Remada baixa · 3x12 · 60s</span>
              <span>Prancha · 4x40s · RPE 8</span>
            </div>
          </article>

          <article className="panel">
            <PanelHeader icon={CalendarDays} title="Agenda do aluno" action="Remarcar" />
            <div className="schedule-list">
              {classSchedule.slice(0, 3).map((item) => (
                <div className="schedule-row" key={`student-${item.time}`}>
                  <strong>{item.time}</strong>
                  <div>
                    <span>{item.className}</span>
                    <small>
                      {item.coach} · {item.room}
                    </small>
                  </div>
                  <em>OK</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <PanelHeader icon={ClipboardCheck} title="Evolucao" action="Ver historico" />
            <div className="assessment-grid portal-assessments">
              {assessments.slice(0, 3).map((assessment) => (
                <article className={`assessment-card ${assessment.tone}`} key={assessment.metric}>
                  <span>{assessment.metric}</span>
                  <strong>{assessment.current}</strong>
                  <em>{assessment.change}</em>
                </article>
              ))}
            </div>
          </article>

          <article className="panel">
            <PanelHeader icon={MessageCircle} title="Comunicados da academia" action="Responder" />
            <div className="portal-messages">
              <div>
                <strong>Renovacao de plano</strong>
                <span>Seu plano esta ativo e pode ser renovado pelo app.</span>
              </div>
              <div>
                <strong>Avaliacao fisica</strong>
                <span>Nova avaliacao recomendada para acompanhar {selectedStudent.goal}.</span>
              </div>
              <div>
                <strong>Treino atualizado</strong>
                <span>O instrutor ajustou cargas e descanso do treino atual.</span>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function QrCodeIcon() {
  return (
    <span className="qr-icon" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <article className="metric-card">
      <div>
        <Icon size={21} />
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <em>{change}</em>
    </article>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action: string;
}) {
  return (
    <div className="panel-header">
      <h2>
        <Icon size={20} />
        {title}
      </h2>
      <button>{action}</button>
    </div>
  );
}

export default App;
