# 🔍 LÓGICA DE BÚSQUEDA - BACKUP COMPLETO

## 📋 RESUMEN GENERAL

El componente `AsisList.jsx` implementa un sistema de búsqueda híbrido con dos estrategias:

1. **Búsqueda Global (Preferida)**: Usa endpoint de API con parámetro `search`
2. **Fallback Local**: Si falla la búsqueda global, obtiene todos los datos y filtra localmente

## 🎯 ESTADOS Y VARIABLES CLAVE

```javascript
const [searchTerm, setSearchTerm] = useState('');
const [isGlobalSearch, setIsGlobalSearch] = useState(false);
const [globalSearching, setGlobalSearching] = useState(false);
const [debugInfo, setDebugInfo] = useState({
  totalFetched: 0,
  pagesRequested: 0,
  apiCalls: [],
  lastSearchTime: null
});
```

## 🔄 FLUJO PRINCIPAL DE BÚSQUEDA

### 1. **useEffect para manejar cambios en searchTerm**
```javascript
useEffect(() => {
  if (!searchTerm.trim()) {
    setIsGlobalSearch(false);
    setFilteredParticipantes(participantes);
    return;
  }

  // SOLO hacer búsqueda global - eliminamos la búsqueda local que causa conflictos
  const timeoutId = setTimeout(() => {
    performGlobalSearch(searchTerm);
  }, 600); // Debounce de 600ms

  return () => clearTimeout(timeoutId);
}, [searchTerm]);
```

### 2. **Función performGlobalSearch() - ESTRATEGIA PRINCIPAL**

```javascript
const performGlobalSearch = async (searchValue) => {
  // Validaciones iniciales
  if (!searchValue.trim()) {
    setIsGlobalSearch(false);
    setFilteredParticipantes(participantes);
    return;
  }

  // Solo hacer búsqueda si el término actual coincide (evita race conditions)
  if (searchValue !== searchTerm) return;

  const startTime = Date.now();
  setGlobalSearching(true);
  setIsGlobalSearch(true);

  try {
    // ✅ USAR EL ENDPOINT DE BÚSQUEDA DE LA API
    const searchUrl = `/api/participantes?search=${encodeURIComponent(searchValue)}&limit=10000&offset=0`;
    
    const response = await fetch(searchUrl);
    
    if (response.ok) {
      // Verificar que la respuesta sea JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Respuesta no es JSON. Content-Type: ${contentType}`);
      }

      const data = await response.json();
      const searchResults = data.participantes || [];
      
      // ✅ Los resultados ya vienen filtrados desde la API
      if (searchValue === searchTerm) {
        setFilteredParticipantes(searchResults);
      }
      
    } else {
      // Si falla la búsqueda API, usar fallback
      await performFallbackSearch(searchValue, startTime);
    }

  } catch (error) {
    // En caso de error, usar fallback
    await performFallbackSearch(searchValue, startTime);
  } finally {
    setGlobalSearching(false);
  }
};
```

### 3. **Función performFallbackSearch() - ESTRATEGIA DE RESPALDO**

```javascript
const performFallbackSearch = async (searchValue, startTime) => {
  try {
    // Obtener TODOS los datos con un limit alto
    const fallbackUrl = `/api/participantes?limit=${Math.max(10000, totalParticipantes || 5000)}&offset=0`;
    
    const response = await fetch(fallbackUrl);

    if (response.ok) {
      const data = await response.json();
      let allResults = data.participantes || [];
      
      // Si necesita más páginas para obtener todos los datos
      if (allResults.length < totalParticipantes && allResults.length > 0) {
        const totalPages = Math.ceil(totalParticipantes / allResults.length);
        
        // Obtener páginas adicionales (máximo 10 para evitar sobrecarga)
        for (let page = 1; page < Math.min(totalPages, 10); page++) {
          const pageResponse = await fetch(`/api/participantes?limit=300&offset=${page * 300}`);
          if (pageResponse.ok) {
            const pageData = await pageResponse.json();
            const pageParticipantes = pageData.participantes || [];
            allResults.push(...pageParticipantes);
            
            if (pageParticipantes.length === 0) break;
          }
        }
      }
      
      // ✅ FILTRADO LOCAL - CRITERIOS DE BÚSQUEDA
      const filteredResults = allResults.filter(p => {
        const searchLower = searchValue.toLowerCase();
        return p.nombre.toLowerCase().includes(searchLower) ||
               p.numero_asignado.toLowerCase().includes(searchLower) ||
               p.telefono.includes(searchValue);
      });

      // Aplicar resultados si el término de búsqueda sigue siendo el mismo
      if (searchValue === searchTerm) {
        setFilteredParticipantes(filteredResults);
      }
    }
  } catch (fallbackError) {
    // Si todo falla, mostrar lista vacía
    if (searchValue === searchTerm) {
      setFilteredParticipantes([]);
    }
  }
};
```

## 🛠️ FUNCIONES DE UTILIDAD

### **handleSearchChange()** - Manejo de cambios en input
```javascript
const handleSearchChange = (value) => {
  setSearchTerm(value);
};
```

### **clearSearch()** - Limpiar búsqueda
```javascript
const clearSearch = () => {
  setSearchTerm('');
  setIsGlobalSearch(false);
  setFilteredParticipantes(participantes);
};
```

## 🎨 UI/UX FEATURES

### **Input de búsqueda inteligente**
```javascript
<input
  type="text"
  placeholder={
    globalSearching 
      ? "Buscando en toda la base de datos..." 
      : isGlobalSearch 
        ? "Resultados globales - Edite para buscar nuevamente" 
        : "Buscar por nombre, número o teléfono en toda la base de datos..."
  }
  value={searchTerm}
  onChange={(e) => handleSearchChange(e.target.value)}
  className={`w-full pl-10 pr-20 py-3 bg-blue-950/60 border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 ${
    isGlobalSearch 
      ? 'border-blue-500 focus:border-blue-400 focus:ring-blue-500/20' 
      : 'border-blue-800/40 focus:border-blue-500 focus:ring-blue-500/20'
  }`}
  disabled={globalSearching}
/>
```

### **Indicadores visuales**
- **Loading spinner** en el ícono de búsqueda durante `globalSearching`
- **Badge "Global"** cuando `isGlobalSearch` es true
- **Botón X** para limpiar búsqueda cuando hay `searchTerm`
- **Mensaje de "No se encontraron resultados"** cuando búsqueda global no encuentra nada

### **Paginación inteligente**
```javascript
{!isGlobalSearch && (
  // Solo mostrar paginación cuando NO hay búsqueda global activa
  <div className="p-6 bg-blue-950/30 border-t border-blue-800/40">
    {/* Controles de paginación */}
  </div>
)}
```

## 🐛 SISTEMA DE DEBUG

### **debugInfo state** - Tracking completo
```javascript
const [debugInfo, setDebugInfo] = useState({
  totalFetched: 0,
  pagesRequested: 0,
  apiCalls: [],
  lastSearchTime: null
});
```

### **Botón de diagnóstico** - Test completo de API
```javascript
<button onClick={async () => {
  // Test de conectividad a múltiples endpoints
  const tests = [
    { name: '🏠 Health Check', url: '/api/health' },
    { name: '📊 Status', url: '/api/status' },
    { name: '👥 Participantes (1)', url: '/api/participantes?limit=1' },
    { name: '🔢 Total', url: '/api/total_participantes' },
    { name: '🔍 Búsqueda Test', url: '/api/participantes?search=test&limit=1' }
  ];
  
  // Para cada test, hacer fetch y loggear resultados detallados
}}>
  🔧 Test API
</button>
```

## 🔑 PUNTOS CLAVE DE LA IMPLEMENTACIÓN

1. **Debounce de 600ms** para evitar búsquedas excesivas
2. **Race condition prevention** verificando que `searchValue === searchTerm`
3. **Content-Type validation** para detectar respuestas HTML en lugar de JSON
4. **Fallback robusto** si la búsqueda directa falla
5. **Límite de páginas** en fallback para evitar sobrecarga (máximo 10 páginas)
6. **Debug tracking completo** para diagnosticar problemas
7. **UI responsiva** con indicadores visuales claros

## 🎯 CRITERIOS DE BÚSQUEDA

La búsqueda funciona en estos campos:
- **Nombre**: Búsqueda case-insensitive con `includes()`
- **Número asignado**: Búsqueda case-insensitive con `includes()`
- **Teléfono**: Búsqueda exacta con `includes()`

## 📡 ENDPOINTS UTILIZADOS

1. **Búsqueda global**: `/api/participantes?search=${searchValue}&limit=10000&offset=0`
2. **Fallback (todos los datos)**: `/api/participantes?limit=${limit}&offset=0`
3. **Paginación fallback**: `/api/participantes?limit=300&offset=${page * 300}`

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Performance**: La búsqueda global es más eficiente que el fallback
2. **Error handling**: Siempre hay fallback si la búsqueda principal falla
3. **Memory management**: Se limita el número de páginas en fallback
4. **User experience**: Loading states y placeholders informativos
5. **State consistency**: Verificaciones para evitar race conditions

---

**Fecha de backup**: 7 de octubre de 2025  
**Archivo**: `/home/blackrubick/Escritorio/carrera_med_app/frontend/src/components/AsisList.jsx`  
**Líneas**: 1-731
