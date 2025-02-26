# Inicializa o repositório Git (caso ainda não tenha sido inicializado)
git init

# Adiciona o repositório remoto
git remote add origin git@github.com:Dslpss/gerenciamento.git

# Verifica se já existe uma branch principal
$branchExists = git show-ref --quiet refs/heads/main
if ($branchExists) {
    Write-Host "Branch main já existe."
} else {
    Write-Host "Criando branch main..."
    git checkout -b main
}

# Adiciona todos os arquivos ao staging
git add .

# Cria o primeiro commit
git commit -m "Implementação inicial do sistema de gerenciamento de gastos"

# Configura a branch local para rastrear a remota
git branch --set-upstream-to=origin/main main

# Pusha para o repositório remoto
Write-Host "Enviando código para o repositório remoto..."
git push -u origin main

Write-Host "Configuração concluída! O projeto foi enviado para github.com:Dslpss/gerenciamento.git"
