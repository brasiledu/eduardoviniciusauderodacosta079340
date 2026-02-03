# Pet Manager - Frontend

Sistema de gerenciamento de Pets e Tutores desenvolvido em Angular para o Processo seletivo da SEPLAG/MT.

## Tecnologias Utilizadas

- **Angular 21** - Framework principal
- **TypeScript** - Linguagem de programação
- **Tailwind CSS v4** - Framework de estilização (prioridade do edital)
- **RxJS** - Programação reativa

## Estrutura do Projeto

```
src/app/
├── core/                    # Módulo central (singleton)
│   ├── guards/              # Guards de rota (AuthGuard)
│   ├── interceptors/        # Interceptors HTTP (AuthInterceptor)
│   ├── models/              # Interfaces e tipos
│   └── services/            # Serviços globais (AuthService)
├── shared/                  # Componentes compartilhados
│   └── components/          # Componentes reutilizáveis
├── features/                # Módulos de funcionalidades
│   ├── auth/                # Autenticação (Login)
│   ├── pets/                # CRUD de Pets (Lazy Loaded)
│   └── tutores/             # CRUD de Tutores (Lazy Loaded)
└── app.routes.ts            # Configuração de rotas
```

## Padrões de Arquitetura

### Padrão Facade
Componentes visuais **NÃO** chamam HttpClient/Service diretamente. Eles utilizam classes Facade que encapsulam a lógica de negócio.

```
Componente → Facade → Service → HttpClient → API
```

### State Management com BehaviorSubject
O Facade utiliza `BehaviorSubject` do RxJS para gerenciar o estado reativo da aplicação.

### Lazy Loading
Os módulos de `Pets` e `Tutores` são carregados sob demanda para otimizar a performance inicial.

## Autenticação

- **Login**: POST `/autenticacao/login`
- **Refresh Token**: PUT `/autenticacao/refresh`
- **Interceptor**: Adiciona token automaticamente e trata erro 401 com refresh automático

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Build para produção
npm run build
```

## API

A aplicação consome a API disponível em:
- **Swagger**: https://pet-manager-api.geia.vip/q/swagger-ui/

## Convenção de Commits

Este projeto segue o padrão **Conventional Commits**:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `chore`: Tarefas de manutenção
- `docs`: Documentação
- `refactor`: Refatoração de código

## Autor

Eduardo Vinicius

