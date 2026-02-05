# Pet Manager - Frontend

Sistema de gerenciamento de Pets e Tutores desenvolvido em Angular para o Processo seletivo da SEPLAG/MT.

## Status do Projeto

-  **ETAPA 1** - Autenticação (Login + Interceptor)
-  **ETAPA 2** - Módulo Pets (CRUD Completo)
-  **ETAPA 3** - Detalhes e Formulário de Pets (Upload de Foto)
-  **ETAPA 4** - Módulo Tutores (CRUD + Vínculo Pet-Tutor)
-  **ETAPA 5** - Finalização (Health Check, Testes, Docker)

## Tecnologias Utilizadas

- **Angular 21** - Framework principal
- **TypeScript** - Linguagem de programação
- **Tailwind CSS v3** - Framework de estilização
- **RxJS** - Programação reativa
- **Jasmine/Karma** - Testes unitários
- **Docker** - Containerização
- **Nginx** - Servidor web para produção

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
│   │   ├── models/          # Pet, PetResponse, PetFilter
│   │   ├── services/        # PetService (HttpClient)
│   │   ├── facades/         # PetFacade (BehaviorSubject)
│   │   └── pages/           # pet-list, pet-form, pet-detail
│   └── tutores/             # CRUD de Tutores (Lazy Loaded)
│       ├── models/          # Tutor, TutorResponse, TutorFilter
│       ├── services/        # TutorService (HttpClient)
│       ├── facades/         # TutorFacade (BehaviorSubject)
│       └── pages/           # tutor-list, tutor-form, tutor-detail
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

## Funcionalidades Implementadas

### Autenticação
- Login com email e senha
- Refresh token automático
- Interceptor HTTP para adicionar token
- Guard de rota para proteção de páginas

### Módulo Pets
- Listar pets com paginação
- Buscar pets por nome
- Criar novo pet
- Editar pet existente
- Visualizar detalhes do pet (com dados do tutor)
- Excluir pet
- Upload de foto (validação de tamanho e tipo)
- Vincular tutor ao pet no cadastro

### Módulo Tutores
- Listar tutores com paginação
- Buscar tutores por nome
- Criar novo tutor
- Editar tutor existente
- Visualizar detalhes do tutor
- Excluir tutor
- Formatação automática de CPF e telefone
- **Vínculo Pet-Tutor**: Vincular/desvincular pets na tela de detalhes
- Upload de foto do tutor

### Health Check
- Serviço de verificação de saúde da API
- Endpoint de liveness para monitoramento

## Autenticação

- **Login**: POST `/autenticacao/login`
- **Refresh Token**: PUT `/autenticacao/refresh`
- **Interceptor**: Adiciona token automaticamente e trata erro 401 com refresh automático

## Instalação e Execução

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes unitários
npm test

# Executar testes em modo watch
npm run test:watch
```

### Executar com Docker

#### Opção 1: Docker Compose (Recomendado)

```bash
# Build e start dos containers
docker-compose up --build

# Acessar a aplicação
# Frontend: http://localhost:8080
```

#### Opção 2: Docker Manual

```bash
# Build da imagem
docker build -t pet-manager-frontend .

# Executar container
docker run -p 8080:80 pet-manager-frontend

# Acessar a aplicação
# Frontend: http://localhost:8080
```

### Variáveis de Ambiente

O projeto usa diferentes configurações para desenvolvimento e produção:

- **Desenvolvimento**: `src/environments/environment.ts`
- **Produção**: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://pet-manager-api.geia.vip'
};
```

## API

A aplicação consome a API disponível em:
- **Swagger**: https://pet-manager-api.geia.vip/q/swagger-ui/

## Testes

O projeto inclui testes unitários para os componentes críticos (PetFacade).

### Como executar os testes:

```bash
# Executar todos os testes
npm test

# Executar testes específicos de um arquivo
npm test -- pet.facade.spec.ts

# Executar testes em modo watch (reexecuta ao modificar arquivos)
npm test -- --watch

# Executar testes com coverage
npm test -- --code-coverage
```

### Arquivos de Teste Implementados

- **PetFacade** (`pet.facade.spec.ts`)
  - Teste de inicialização do BehaviorSubject
  - Teste de atualização de estado após loading
  - Teste de tratamento de erros
  - Teste de observables (pets$, loading$, error$)
  - Teste de paginação e busca

### Exemplo de Teste (BehaviorSubject)

```typescript
it('should update BehaviorSubject state after loading pets', (done) => {
  const states: any[] = [];
  facade.state$.subscribe(state => states.push(state));

  facade.loadPets();

  // Simula resposta HTTP
  const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=0&size=10`);
  req.flush(mockPetResponse);

  setTimeout(() => {
    const finalState = states[states.length - 1];
    expect(finalState.loading).toBe(false);
    expect(finalState.pets).toEqual(mockPets);
    expect(finalState.totalElements).toBe(2);
    done();
  });
});
```

## Arquitetura Docker

O projeto utiliza **multi-stage build** para otimizar o tamanho da imagem final:

### Stage 1: Build
- Usa `node:20-alpine` para compilar a aplicação
- Instala dependências e executa `ng build --configuration production`
- Gera arquivos estáticos otimizados

### Stage 2: Serve
- Usa `nginx:alpine` (imagem mínima)
- Copia apenas os arquivos compilados do stage anterior
- Configura Nginx para servir a aplicação Angular (SPA routing)

**Tamanho final da imagem**: ~25MB (apenas Nginx + arquivos estáticos)

## Estrutura de Arquivos Docker

```
pet-manager-frontend/
├── Dockerfile              # Multi-stage build (Node + Nginx)
├── docker-compose.yml      # Orquestração de containers
├── nginx.conf             # Configuração do Nginx para SPA
└── .dockerignore          # Arquivos ignorados no build
```

## Convenção de Commits

Este projeto segue o padrão **Conventional Commits**:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `chore`: Tarefas de manutenção
- `docs`: Documentação
- `refactor`: Refatoração de código

## Autor

Eduardo Vinicius

