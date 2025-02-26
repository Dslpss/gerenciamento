#!/bin/bash

# Inicializa o repositório Git (caso ainda não tenha sido inicializado)
git init

# Adiciona o repositório remoto
git remote add origin git@github.com:Dslpss/gerenciamento.git

# Verifica se já existe uma branch principal
if git show-ref --quiet refs/heads/main; then
    echo "Branch main já existe."
else
    echo "Criando branch main..."
    git checkout -b main
fi

# Adiciona todos os arquivos ao staging
git add .

# Cria o primeiro commit
git commit -m "Implementação inicial do sistema de gerenciamento de gastos"

# Configura a branch local para rastrear a remota
git branch --set-upstream-to=origin/main main

# Pusha para o repositório remoto (usando --force apenas na primeira vez, com cuidado!)
echo "Enviando código para o repositório remoto..."
git push -u origin main

echo "Configuração concluída! O projeto foi enviado para github.com:Dslpss/gerenciamento.git"
