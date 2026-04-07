import { execSync } from 'child_process';

try {
  console.log('🚀 Iniciando deploy para GitHub...\n');

  // Configurar git
  execSync('git config user.name "v0[bot]"');
  execSync('git config user.email "v0[bot]@users.noreply.github.com"');
  console.log('✓ Git configurado');

  // Verificar status
  const status = execSync('git status --short').toString();
  console.log('📝 Status do repositório:', status || 'Sem mudanças rastreadas');

  // Adicionar arquivo
  execSync('git add index.html');
  console.log('✓ Arquivo index.html adicionado');

  // Fazer commit
  const commitMessage = `Transformação T7 Store em ecommerce de conversão alta

- Adicionadas 27 produtos em 4 categorias
- Seções de conversão: Mais Vendidos, Ofertas da Semana, Últimas Unidades
- 6 depoimentos de clientes com sistema de avaliação
- Banner promocional com countdown
- Barra de benefícios com ícones
- Modal de produto melhorado
- Carrinho persistente com localStorage
- Checkout via WhatsApp
- Design responsivo mobile-first
- Otimizações de UX/UI para maximizar conversões

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>`;

  execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
  console.log('✓ Commit realizado');

  // Fazer push
  execSync('git push origin analise-de-codigo');
  console.log('✓ Push realizado para analise-de-codigo');

  console.log('\n✅ Deploy concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  process.exit(1);
}
