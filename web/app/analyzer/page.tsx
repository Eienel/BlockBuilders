import { PortfolioAnalyzer } from '@/components/PortfolioAnalyzer';

export const metadata = {
  title: 'Portfolio Analyzer | Suisei',
  description: 'See your Sui wallet balance, stakes, and rewards in one call.',
};

export default function AnalyzerPage() {
  return <PortfolioAnalyzer />;
}
