import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  HelpCircle, 
  Clipboard, 
  Loader2, 
  Coins, 
  Package, 
  Undo,
  TrendingDown
} from 'lucide-react';

export default function Importar({ user }) {
  const [importType, setImportType] = useState('gastos'); // 'gastos' or 'materiales'
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [step, setStep] = useState(1); // 1: Carga, 2: Mapeo & Previsualización, 3: Importando, 4: Listo
  
  // States for processing & uploading
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  // Template examples
  const templates = {
    gastos: {
      headers: ['descripcion', 'monto', 'categoria', 'fecha', 'afecto_iva', 'tipo_documento'],
      example: 'Compra soldadura indura;45000;INSUMOS;2026-05-21;true;FACTURA\nPar de sellos Komatsu;120000;REPUESTOS;2026-05-20;false;BOLETA\nPago CGE Electricidad;85000;SERVICIOS;2026-05-15;true;FACTURA'
    },
    materiales: {
      headers: ['nombre', 'precio_referencia', 'unidad_medida', 'tipo'],
      example: 'Acero A36 10mm;4200;KG;Planchas\nElectrodo Indura 7018;6500;KG;Soldadura\nOxigeno Industrial;35000;M3;Gases'
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Safe Javascript CSV Parser
  const parseCSV = (text) => {
    // Detect delimiter
    const commaCount = (text.match(/,/g) || []).length;
    const semicolonCount = (text.match(/;/g) || []).length;
    const tabCount = (text.match(/\t/g) || []).length;
    
    let delimiter = ',';
    if (semicolonCount > commaCount) delimiter = ';';
    if (tabCount > semicolonCount && tabCount > commaCount) delimiter = '\t';

    const lines = text.split(/\r?\n/);
    const parsedRows = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quotes in fields properly
      const row = [];
      let inQuotes = false;
      let currentField = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          row.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      row.push(currentField.trim());
      parsedRows.push(row);
    }

    return parsedRows;
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rawRows = parseCSV(text);
      
      if (rawRows.length < 2) {
        alert('El archivo no contiene suficientes filas. Debe contener una fila de encabezados y al menos una de datos.');
        return;
      }

      const fileHeaders = rawRows[0].map(h => h.toLowerCase().replace(/['"]/g, '').trim());
      const fileData = rawRows.slice(1);

      setHeaders(fileHeaders);
      setCsvData(fileData);

      // Guess initial mapping
      const initialMap = {};
      const targetFields = templates[importType].headers;
      
      targetFields.forEach(field => {
        // Try exact match
        let matchIndex = fileHeaders.findIndex(h => h === field);
        // Try partial match
        if (matchIndex === -1) {
          matchIndex = fileHeaders.findIndex(h => h.includes(field) || field.includes(h));
        }
        // Specific mapping guesses
        if (matchIndex === -1 && field === 'descripcion') {
          matchIndex = fileHeaders.findIndex(h => h === 'detalle' || h === 'nombre' || h === 'gasto' || h === 'glosa');
        }
        if (matchIndex === -1 && field === 'precio_referencia') {
          matchIndex = fileHeaders.findIndex(h => h === 'precio' || h === 'valor' || h === 'costo');
        }
        if (matchIndex === -1 && field === 'monto') {
          matchIndex = fileHeaders.findIndex(h => h === 'total' || h === 'valor' || h === 'costo' || h === 'precio');
        }

        initialMap[field] = matchIndex !== -1 ? matchIndex.toString() : '';
      });

      setMapping(initialMap);
      setStep(2);
      validateData(fileData, initialMap);
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const validateData = (data, currentMap) => {
    const errors = [];
    data.forEach((row, rowIndex) => {
      const rowNum = rowIndex + 2; // header is row 1
      
      if (importType === 'gastos') {
        const descIdx = parseInt(currentMap.descripcion);
        const montoIdx = parseInt(currentMap.monto);
        
        if (isNaN(descIdx) || !row[descIdx]) {
          errors.push({ row: rowNum, col: 'Descripción', error: 'Descripción vacía' });
        }
        if (isNaN(montoIdx) || isNaN(parseFloat(row[montoIdx]))) {
          errors.push({ row: rowNum, col: 'Monto', error: 'El Monto debe ser numérico' });
        }
      } else {
        const nombreIdx = parseInt(currentMap.nombre);
        const precioIdx = parseInt(currentMap.precio_referencia);

        if (isNaN(nombreIdx) || !row[nombreIdx]) {
          errors.push({ row: rowNum, col: 'Nombre', error: 'Nombre de material vacío' });
        }
        if (isNaN(precioIdx) || isNaN(parseFloat(row[precioIdx]))) {
          errors.push({ row: rowNum, col: 'Precio', error: 'El Precio debe ser numérico' });
        }
      }
    });
    setValidationErrors(errors);
  };

  const handleMapChange = (field, colIndexString) => {
    const updatedMap = { ...mapping, [field]: colIndexString };
    setMapping(updatedMap);
    validateData(csvData, updatedMap);
  };

  const copyTemplateToClipboard = () => {
    const t = templates[importType];
    const textToCopy = `${t.headers.join(';')}\n${t.example}`;
    navigator.clipboard.writeText(textToCopy);
    alert('Plantilla copiada al portapapeles. Pégala en un Bloc de Notas o impórtala en Excel.');
  };

  const handleImport = async () => {
    // Confirm importing
    setStep(3);
    setLoading(true);
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const totalRows = csvData.length;
    let success = 0;
    let fails = 0;

    for (let i = 0; i < totalRows; i++) {
      const row = csvData[i];
      try {
        if (importType === 'gastos') {
          const descVal = row[parseInt(mapping.descripcion)];
          const montoVal = parseFloat(row[parseInt(mapping.monto)]);
          const catVal = row[parseInt(mapping.categoria)] || 'OTROS';
          const fechaVal = row[parseInt(mapping.fecha)] || new Date().toISOString().split('T')[0];
          
          let afectoIvaVal = true;
          if (mapping.afecto_iva && row[parseInt(mapping.afecto_iva)]) {
            const rawVal = row[parseInt(mapping.afecto_iva)].toLowerCase();
            afectoIvaVal = rawVal === 'true' || rawVal === '1' || rawVal === 'si' || rawVal === 'sí';
          }
          
          const tipoDocVal = (mapping.tipo_documento && row[parseInt(mapping.tipo_documento)]) || 'FACTURA';

          const payload = {
            descripcion: descVal,
            monto: montoVal,
            categoria: catVal.toUpperCase(),
            fecha: new Date(fechaVal).toISOString(),
            tipo_documento: tipoDocVal.toUpperCase(),
            afecto_iva: afectoIvaVal
          };

          await axios.post('/api/gasto', payload, { headers });
        } else {
          // Material Import
          const nombreVal = row[parseInt(mapping.nombre)];
          const precioVal = parseFloat(row[parseInt(mapping.precio_referencia)]) || 0;
          const unidadVal = row[parseInt(mapping.unidad_medida)] || 'C/U';
          const tipoVal = row[parseInt(mapping.tipo)] || 'Otros';

          const payload = {
            nombre: nombreVal,
            precio_referencia: precioVal,
            unidad_medida: unidadVal,
            tipo: tipoVal
          };

          await axios.post('/api/material', payload, { headers });
        }
        success++;
        setSuccessCount(success);
      } catch (error) {
        console.error('Error importing row:', error);
        fails++;
        setErrorCount(fails);
      }
      setProgress(Math.round(((i + 1) / totalRows) * 100));
    }

    setLoading(false);
    setStep(4);
  };

  const handleReset = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setValidationErrors([]);
    setStep(1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <FileSpreadsheet className="text-purple-600 mr-2.5" size={26} />
            Centro de Importación Masiva (Excel/CSV)
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-semibold">
            Sube las cuentas del taller o inventarios completos directamente desde tus planillas Excel exportadas a CSV.
          </p>
        </div>
        
        {step > 1 && (
          <button 
            onClick={handleReset} 
            className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-250 border border-gray-200 px-3.5 py-2 rounded-xl transition-all"
          >
            <Undo size={14} />
            <span>Subir otro archivo</span>
          </button>
        )}
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Drag & Drop Zone Area */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Import Type Selector Tabs */}
            <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm flex space-x-2">
              <button 
                onClick={() => setImportType('gastos')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  importType === 'gastos' 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Coins size={18} />
                <span>Importar Gastos (Cuentas)</span>
              </button>

              <button 
                onClick={() => setImportType('materiales')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  importType === 'materiales' 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Package size={18} />
                <span>Importar Materiales (Inventario)</span>
              </button>
            </div>

            {/* Drag & Drop File Container */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 relative flex flex-col items-center justify-center min-h-[320px] bg-white shadow-sm ${
                dragActive 
                  ? 'border-purple-600 bg-purple-50/20 scale-[1.01]' 
                  : 'border-gray-250 hover:border-purple-400 hover:bg-slate-50/50'
              }`}
            >
              <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 border border-purple-100 animate-pulse">
                <Upload size={30} />
              </div>
              
              <h3 className="text-base font-extrabold text-gray-900">
                Arrastra tu archivo CSV aquí
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-1.5 max-w-sm leading-relaxed">
                Guarda tu planilla Excel como **CSV (valores delimitados por comas o punto y comas)** y súbela aquí.
              </p>
              
              <div className="mt-6">
                <label className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02] inline-block">
                  Seleccionar Archivo
                  <input 
                    type="file" 
                    accept=".csv,.txt" 
                    onChange={handleFileSelect}
                    className="hidden" 
                  />
                </label>
              </div>

              <span className="block text-[10px] text-gray-400 font-semibold mt-4">
                Soporta codificación UTF-8 y delimitadores estándar.
              </span>
            </div>
          </div>

          {/* Guide & Template Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider flex items-center">
                <HelpCircle className="text-purple-600 mr-2" size={18} />
                Guía de 2 Pasos
              </h3>
              
              <div className="space-y-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <div className="flex items-start space-x-2.5">
                  <span className="h-5 w-5 bg-purple-100 text-purple-700 font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <p>Abre tu Excel y haz clic en **Guardar como...**</p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="h-5 w-5 bg-purple-100 text-purple-700 font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <p>Selecciona el tipo **CSV delimitado por comas (*.csv)** y haz clic en Guardar.</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <span className="block text-[11px] font-bold text-gray-450 uppercase mb-2">Columnas del sistema:</span>
                <div className="flex flex-wrap gap-1.5">
                  {templates[importType].headers.map((h) => (
                    <code key={h} className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-700">
                      {h}
                    </code>
                  ))}
                </div>
              </div>

              <button 
                onClick={copyTemplateToClipboard}
                className="w-full flex items-center justify-center space-x-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors mt-2"
              >
                <Clipboard size={14} />
                <span>Copiar Plantilla CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          
          {/* File summary and validation stats */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Mapear Columnas de: <span className="text-purple-600 font-black">{file.name}</span>
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Detectamos **{csvData.length} filas** de datos. Empareja tus columnas para iniciar la importación.
              </p>
            </div>

            {validationErrors.length > 0 ? (
              <span className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 font-bold text-[10px] rounded-lg flex items-center space-x-1.5 animate-pulse">
                <AlertCircle size={14} />
                <span>Hay {validationErrors.length} advertencias detectadas</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-250 text-emerald-700 font-bold text-[10px] rounded-lg flex items-center space-x-1.5">
                <CheckCircle size={14} />
                <span>Datos listos para importar</span>
              </span>
            )}
          </div>

          {/* Mapping Wizard Panel */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 p-4 rounded-xl border border-gray-100">
            {templates[importType].headers.map((field) => {
              const isRequired = field === 'descripcion' || field === 'monto' || field === 'nombre' || field === 'precio_referencia';
              return (
                <div key={field} className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 flex items-center">
                    {field.replace('_', ' ').toUpperCase()}
                    {isRequired && <span className="text-red-500 ml-1 font-bold">*</span>}
                  </label>
                  <select 
                    value={mapping[field] || ''}
                    onChange={(e) => handleMapChange(field, e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">-- No importar o usar por defecto --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Columna {i + 1}: {h}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Table Previewer */}
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Previsualización de los primeros 10 registros</span>
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="p-3">Fila</th>
                    {templates[importType].headers.map((field) => (
                      <th key={field} className="p-3 uppercase">
                        {field.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {csvData.slice(0, 10).map((row, rowIndex) => {
                    const rowNum = rowIndex + 2;
                    return (
                      <tr key={rowIndex} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-gray-400">#{rowNum}</td>
                        {templates[importType].headers.map((field) => {
                          const colIdx = parseInt(mapping[field]);
                          const val = isNaN(colIdx) ? '-' : row[colIdx] || '';
                          
                          // Check validation specifically for this field
                          const hasError = validationErrors.some(
                            err => err.row === rowNum && 
                            ((field === 'monto' && err.col === 'Monto') || 
                             (field === 'descripcion' && err.col === 'Descripción') ||
                             (field === 'nombre' && err.col === 'Nombre') ||
                             (field === 'precio_referencia' && err.col === 'Precio'))
                          );

                          return (
                            <td 
                              key={field} 
                              className={`p-3 font-medium ${
                                hasError ? 'bg-red-50/50 text-red-700 font-bold' : 'text-gray-700'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validation alerts messages */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center font-bold">
                <AlertCircle className="mr-2" size={16} />
                <span>Advertencias de datos detectadas:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 font-semibold">
                {validationErrors.slice(0, 3).map((err, i) => (
                  <li key={i}>
                    Fila {err.row}: La columna **{err.col}** tiene error: {err.error}
                  </li>
                ))}
                {validationErrors.length > 3 && (
                  <li>... y otros {validationErrors.length - 3} errores más.</li>
                )}
              </ul>
              <span className="block text-[10px] text-amber-600 font-medium leading-relaxed mt-1">
                Puedes proceder de todas formas, pero los campos con errores severos se ignorarán o usarán valores por defecto. Te recomendamos verificar tu Excel.
              </span>
            </div>
          )}

          {/* Import Action Trigger Buttons */}
          <div className="flex justify-end space-x-3 border-t border-gray-150 pt-4">
            <button 
              onClick={handleReset} 
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-xs"
            >
              Cancelar
            </button>
            <button 
              onClick={handleImport}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-750 text-white font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] flex items-center space-x-2 text-xs"
            >
              <span>Confirmar e Importar {csvData.length} registros</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center space-y-6">
          <div className="flex flex-col items-center">
            <Loader2 className="text-purple-650 animate-spin mb-4" size={48} />
            <h3 className="text-lg font-black text-gray-900">
              Importando datos a Maestranza R.S SPA...
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Procesando fila {successCount + errorCount} de {csvData.length} en tiempo real
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden border border-gray-200 p-0.5">
              <div 
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-gray-400 px-1">
              <span>Progreso: {progress}%</span>
              <span>{successCount + errorCount} / {csvData.length} filas</span>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={36} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              ¡Importación Finalizada con Éxito!
            </h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              El proceso de carga masiva de datos ha concluido correctamente en Supabase.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-50 p-4 rounded-2xl border border-gray-100">
            <div className="text-center p-3">
              <span className="block text-2xl font-black text-emerald-700">{successCount}</span>
              <span className="block text-[10px] text-gray-450 font-bold uppercase tracking-wider mt-1">Guardados</span>
            </div>
            <div className="text-center p-3 border-l border-gray-200">
              <span className="block text-2xl font-black text-red-600">{errorCount}</span>
              <span className="block text-[10px] text-gray-450 font-bold uppercase tracking-wider mt-1">Fallidos</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center space-x-3">
            <button 
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200"
            >
              Importar otra planilla
            </button>
            <button 
              onClick={() => window.location.href = importType === 'gastos' ? '/gastos' : '/materiales'}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-750 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <span>Ver registros importados</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
