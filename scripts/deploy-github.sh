#!/bin/bash

# Configurar git
git config user.name "v0[bot]"
git config user.email "v0[bot]@users.noreply.github.com"

# Adicionar arquivo
git add index.html

# Fazer commit
git commit -m "Transformação T7 Store em ecommerce de conversão alta

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

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"

# Fazer push para a branch analise-de-codigo
git push origin analise-de-codigo

echo "✅ Deploy para GitHub concluído com sucesso!"
