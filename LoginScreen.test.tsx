import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import axios from 'axios';

// Mock do axios
jest.mock('axios');

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { from: { pathname: '/dashboard' } } })
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza corretamente', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Jana Beleza e Estética')).toBeInTheDocument();
    expect(screen.getByText('Acesso ao Sistema')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  test('exibe mensagem de erro quando login falha', async () => {
    // Mock da resposta de erro do axios
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          msg: 'Credenciais inválidas'
        }
      }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </BrowserRouter>
    );

    // Preenche o formulário
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'usuario@teste.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha123' }
    });

    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    // Verifica se a mensagem de erro aparece
    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });

    // Verifica se o axios.post foi chamado com os parâmetros corretos
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'usuario@teste.com',
      senha: 'senha123'
    });

    // Verifica se o navigate não foi chamado
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('redireciona para dashboard após login bem-sucedido', async () => {
    // Mock da resposta de sucesso do axios
    axios.post.mockResolvedValueOnce({
      data: {
        access_token: 'fake-token',
        refresh_token: 'fake-refresh-token',
        user: {
          id: 1,
          nome: 'Usuário Teste',
          email: 'usuario@teste.com',
          role: 'admin'
        }
      }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </BrowserRouter>
    );

    // Preenche o formulário
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'usuario@teste.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha123' }
    });

    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    // Verifica se o axios.post foi chamado com os parâmetros corretos
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'usuario@teste.com',
      senha: 'senha123'
    });

    // Verifica se o navigate foi chamado com o caminho correto
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  test('desabilita o botão durante o processo de login', async () => {
    // Mock da resposta do axios com delay para simular carregamento
    axios.post.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {
              access_token: 'fake-token',
              refresh_token: 'fake-refresh-token',
              user: {
                id: 1,
                nome: 'Usuário Teste',
                email: 'usuario@teste.com',
                role: 'admin'
              }
            }
          });
        }, 100);
      });
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </BrowserRouter>
    );

    // Preenche o formulário
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'usuario@teste.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha123' }
    });

    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    // Verifica se o botão está desabilitado e mostra "Entrando..."
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();

    // Espera o login completar
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
