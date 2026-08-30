# 💎 Gemini Gems Dashboard / Startpage

Um painel visual moderno, personalizável e ultra-rápido para organizar e iniciar conversas diretamente com todos os teus **Gemini Gems**.

---

## 🌟 Funcionalidades Principais

1. **Cartões Visuais com Links Diretos**:
   - Cada cartão exibe ícone/avatar, título, descrição personalizada e botão para iniciar conversa imediata no Google Gemini.
2. **Favoritos & Grupos Estilo Notion (Drag & Drop)**:
   - Reordena e move cartões arrastando-os (**Drag & Drop**) entre grupos ou para a secção de **Favoritos** no topo.
   - Cria novos grupos de Gems (ex: *Programação, Escrita, Análise de Dados, Pessoal*).
   - Secções colapsáveis com número de Gems por grupo.
3. **Sincronização de Novos Gems (Bookmarklet de 1-Clique)**:
   - Inclui um **Bookmarklet automático**: basta arrastar o botão para os teus favoritos do browser.
   - Ao abrir a página oficial [gemini.google.com/gems/view](https://gemini.google.com/gems/view) e clicar no favorito, o script extrai automaticamente os teus Gems e copia o JSON para colares no painel.
4. **Pesquisa Instantânea**:
   - Pressiona `/` em qualquer momento para focar a barra de pesquisa e filtrar Gems por nome, descrição ou tag em tempo real.
5. **Modo Escuro / Claro (Glassmorphism)**:
   - Design moderno com efeito de vidro (*glassmorphism*), sombras neon e suporte a tema escuro/claro.
6. **Persistência & Backup**:
   - Guardado automaticamente no `localStorage` do browser.
   - Suporte a exportação e importação de backups em formato JSON.

---

## 🚀 Como Usar

### 1. Abrir no Browser
Podes abrir o ficheiro diretamente no teu navegador web preferido (Chrome, Edge, Safari, Firefox, Brave, Arc, etc.):
- Abrir diretamente o ficheiro `index.html` (ou definir como Página Inicial / Startpage do browser).

### 2. Sincronizar os teus Gems
1. Clica no botão **Importar Gems** no topo do painel.
2. Arrasta o botão **✨ Extrair Meus Gems** para a barra de Favoritos do teu browser.
3. Abre a página oficial dos teus Gems em [gemini.google.com/gems/view](https://gemini.google.com/gems/view).
4. Clica no favorito **✨ Extrair Meus Gems**.
5. Volta ao Dashboard e cola o texto no campo de importação JSON!

---

## 🎨 Personalização
- **Adicionar Novo Gem**: Clica em `+ Novo Gem` para inserir manualmente qualquer Gem.
- **Criar Categoria**: Clica em `+ Novo Grupo` para organizar por tópicos.
- **Arrastar e Largar**: Pega em qualquer cartão e move-o para a categoria desejada.
