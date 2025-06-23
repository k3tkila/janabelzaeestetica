import { test, expect } from '@playwright/test';

test.describe('Fluxo de Login e Navegação', () => {
  test('deve fazer login com sucesso e navegar pelo app', async ({ page }) => {
    // Acessa a página de login
    await page.goto('/login');
    
    // Verifica se está na página de login
    await expect(page.getByText('Jana Beleza e Estética')).toBeVisible();
    await expect(page.getByText('Acesso ao Sistema')).toBeVisible();
    
    // Preenche o formulário de login
    await page.getByLabel('Email').fill('admin@janaestética.com.br');
    await page.getByLabel('Senha').fill('senha123');
    
    // Clica no botão de login
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Verifica se foi redirecionado para o dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Verifica elementos do dashboard
    await expect(page.getByText('Resumo do Dia')).toBeVisible();
    await expect(page.getByText('Vendas Recentes')).toBeVisible();
    
    // Navega para a página de vendas
    await page.getByRole('link', { name: 'Vendas' }).click();
    await expect(page).toHaveURL('/vendas');
    await expect(page.getByText('Lista de Vendas')).toBeVisible();
    
    // Navega para a página de prontuário
    await page.getByRole('link', { name: 'Prontuário' }).click();
    await expect(page).toHaveURL('/prontuario');
    await expect(page.getByText('Prontuário Eletrônico')).toBeVisible();
    
    // Testa o logout
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL('/login');
  });
  
  test('deve mostrar erro para credenciais inválidas', async ({ page }) => {
    // Acessa a página de login
    await page.goto('/login');
    
    // Preenche o formulário com credenciais inválidas
    await page.getByLabel('Email').fill('usuario@invalido.com');
    await page.getByLabel('Senha').fill('senhaerrada');
    
    // Clica no botão de login
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Verifica se a mensagem de erro aparece
    await expect(page.getByText('Credenciais inválidas')).toBeVisible();
    
    // Verifica se permanece na página de login
    await expect(page).toHaveURL('/login');
  });
  
  test('deve redirecionar para login ao tentar acessar rota protegida', async ({ page }) => {
    // Tenta acessar uma rota protegida diretamente
    await page.goto('/dashboard');
    
    // Verifica se foi redirecionado para o login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Fluxo de Vendas', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@janaestética.com.br');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Verifica se está no dashboard
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('deve listar vendas e visualizar detalhes', async ({ page }) => {
    // Navega para a página de vendas
    await page.getByRole('link', { name: 'Vendas' }).click();
    await expect(page).toHaveURL('/vendas');
    
    // Verifica se a lista de vendas é exibida
    await expect(page.getByText('Lista de Vendas')).toBeVisible();
    
    // Verifica se há pelo menos uma venda na lista
    await expect(page.getByRole('row').nth(1)).toBeVisible();
    
    // Clica no botão de detalhes da primeira venda
    await page.getByRole('button', { name: 'Detalhes' }).first().click();
    
    // Verifica se os detalhes da venda são exibidos
    await expect(page.getByText('Detalhes da Venda')).toBeVisible();
    await expect(page.getByText('Itens da Venda')).toBeVisible();
    await expect(page.getByText('Informações de Pagamento')).toBeVisible();
  });
  
  test('deve iniciar nova venda e adicionar produtos', async ({ page }) => {
    // Navega para a página de nova venda
    await page.getByRole('link', { name: 'Nova Venda' }).click();
    await expect(page).toHaveURL('/nova-venda');
    
    // Verifica se o formulário de nova venda é exibido
    await expect(page.getByText('Nova Venda')).toBeVisible();
    
    // Seleciona um cliente
    await page.getByLabel('Cliente').click();
    await page.getByText('Maria Silva').click();
    
    // Adiciona um produto
    await page.getByRole('button', { name: 'Adicionar Produto' }).click();
    await page.getByLabel('Produto').click();
    await page.getByText('Creme Hidratante Facial 50ml').click();
    await page.getByLabel('Quantidade').fill('2');
    await page.getByRole('button', { name: 'Adicionar' }).click();
    
    // Verifica se o produto foi adicionado à lista
    await expect(page.getByText('Creme Hidratante Facial 50ml')).toBeVisible();
    await expect(page.getByText('2 x')).toBeVisible();
    
    // Verifica se o valor total foi atualizado
    await expect(page.getByText('Total:')).toBeVisible();
  });
});

test.describe('Fluxo de Prontuário', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@janaestética.com.br');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Navega para a página de prontuário
    await page.getByRole('link', { name: 'Prontuário' }).click();
    await expect(page).toHaveURL('/prontuario');
  });
  
  test('deve exibir a comparação visual antes/depois', async ({ page }) => {
    // Seleciona um paciente
    await page.getByLabel('Paciente').click();
    await page.getByText('Ana Oliveira').click();
    
    // Verifica se o prontuário do paciente é carregado
    await expect(page.getByText('Prontuário de Ana Oliveira')).toBeVisible();
    
    // Acessa a aba de comparação visual
    await page.getByRole('tab', { name: 'Comparação Visual' }).click();
    
    // Verifica se o componente de comparação está visível
    await expect(page.getByText('Comparação Antes/Depois')).toBeVisible();
    
    // Seleciona uma região anatômica
    await page.getByLabel('Região').selectOption('face');
    
    // Verifica se as imagens são exibidas
    await expect(page.locator('.before-image')).toBeVisible();
    await expect(page.locator('.after-image')).toBeVisible();
    
    // Testa o controle deslizante de comparação
    const slider = page.locator('.comparison-slider');
    await slider.click();
  });
  
  test('deve exibir a timeline de evolução do paciente', async ({ page }) => {
    // Seleciona um paciente
    await page.getByLabel('Paciente').click();
    await page.getByText('Ana Oliveira').click();
    
    // Acessa a aba de histórico
    await page.getByRole('tab', { name: 'Histórico de Evolução' }).click();
    
    // Verifica se a timeline é exibida
    await expect(page.getByText('Histórico de Evolução')).toBeVisible();
    await expect(page.locator('.timeline-container')).toBeVisible();
    
    // Verifica se há pelo menos um registro na timeline
    await expect(page.locator('.timeline-item').first()).toBeVisible();
    
    // Expande um item da timeline
    await page.locator('.timeline-item').first().click();
    
    // Verifica se os detalhes são exibidos
    await expect(page.locator('.timeline-details')).toBeVisible();
  });
});
