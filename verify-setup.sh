#!/bin/bash

# Script de verificación del entorno para implementación del 35% faltante
# Sistema de Finiquitos - QTX

echo "================================================"
echo "🔍 VERIFICACIÓN DE ENTORNO - FINIQUITOS 35%"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar branch actual
echo "📌 Verificando branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "feature/finiquitos-35-percent-fixes" ]; then
    echo -e "${GREEN}✅ Branch correcto: $CURRENT_BRANCH${NC}"
else
    echo -e "${RED}❌ Branch incorrecto. Actual: $CURRENT_BRANCH${NC}"
    echo "   Ejecutar: git checkout -b feature/finiquitos-35-percent-fixes"
fi
echo ""

# Verificar archivos críticos
echo "📂 Verificando archivos críticos..."
FILES=(
    "apps/dashboard/lib/finiquitos/schemas.ts"
    "apps/dashboard/lib/finiquitos/calculate-finiquito.ts"
    "apps/dashboard/lib/finiquitos/utils.ts"
    "apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx"
    "apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx"
    "apps/dashboard/components/organizations/slug/finiquitos/finiquitos-list.tsx"
)

ALL_FILES_EXIST=true
for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}✅ $FILE${NC}"
    else
        echo -e "${RED}❌ $FILE - NO ENCONTRADO${NC}"
        ALL_FILES_EXIST=false
    fi
done
echo ""

# Verificar dependencias
echo "📦 Verificando dependencias..."
DEPS=("numeral" "date-fns" "zod")
for DEP in "${DEPS[@]}"; do
    if grep -q "\"$DEP\"" package.json; then
        echo -e "${GREEN}✅ $DEP instalado${NC}"
    else
        echo -e "${RED}❌ $DEP NO instalado${NC}"
    fi
done
echo ""

# Verificar compilación
echo "🔨 Verificando compilación..."
echo "   Ejecutando build (esto puede tomar un momento)..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
else
    echo -e "${RED}❌ Build falló${NC}"
    echo "   Ejecutar: npm run build (para ver errores)"
fi
echo ""

# Resumen de tareas
echo "================================================"
echo "📋 TAREAS A IMPLEMENTAR"
echo "================================================"
echo ""
echo "🔴 CRÍTICAS (1h 20min)"
echo "   1. Vacaciones negativas - 5 min"
echo "   2. Prima antigüedad auto - 30 min"
echo "   3. ISR automático - 45 min"
echo ""
echo "🟡 IMPORTANTES (1h 15min)"
echo "   4. Separadores miles - 45 min"
echo "   5. PDF campos - 10 min"
echo "   6. Listado columnas - 20 min"
echo ""
echo "🟢 DESEABLES (7 min)"
echo "   7. Flechitas - 2 min"
echo "   8. PDF espacios - 5 min"
echo ""
echo "🧪 TESTING (1.5h)"
echo "   9. Verificación Excel + E2E"
echo ""
echo "================================================"

# Estado final
echo ""
if [ "$CURRENT_BRANCH" = "feature/finiquitos-35-percent-fixes" ] && [ "$ALL_FILES_EXIST" = true ]; then
    echo -e "${GREEN}✅ ENTORNO LISTO PARA COMENZAR${NC}"
    echo ""
    echo "Siguiente paso:"
    echo "  1. Ejecutar: npm run dev"
    echo "  2. Abrir: http://localhost:3000"
    echo "  3. Comenzar con Tarea 1: Vacaciones negativas"
else
    echo -e "${YELLOW}⚠️  REVISAR PROBLEMAS ANTES DE CONTINUAR${NC}"
fi
echo ""
echo "================================================"