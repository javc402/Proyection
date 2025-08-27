// 🔧 SCRIPT DE UTILIDADES PARA POSTMAN COLLECTION

// 📋 DOCUMENTACIÓN DE USO:
// Este script debe copiarse en el Pre-request Script de cada endpoint que requiera autenticación

// 🔄 FUNCIÓN PARA OBTENER TOKEN AUTOMÁTICAMENTE
function obtenerTokenAutomatico() {
    // Verificar si ya tenemos un token válido
    const currentToken = pm.collectionVariables.get('authToken');
    
    if (currentToken && currentToken !== '') {
        // Intentar decodificar el token para verificar si está expirado
        try {
            const tokenParts = currentToken.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const now = Math.floor(Date.now() / 1000);
                
                // Si el token expira en más de 2 minutos, usarlo
                if (payload.exp && payload.exp > (now + 120)) {
                    console.log('🎫 Usando token existente (válido por ' + Math.floor((payload.exp - now) / 60) + ' minutos más)');
                    return;
                }
            }
        } catch (e) {
            console.log('🔍 Token existente no válido, obteniendo uno nuevo...');
        }
    }
    
    // Si llegamos aquí, necesitamos un token nuevo
    console.log('🔄 Obteniendo token fresco...');
    
    const loginRequest = {
        url: pm.collectionVariables.get('baseUrl') + '/api/auth/login',
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: 'admin@proyection.com',
                password: 'password123'
            })
        }
    };
    
    pm.sendRequest(loginRequest, function (err, response) {
        if (err) {
            console.error('❌ Error obteniendo token:', err);
            return;
        }
        
        if (response.code === 200) {
            const responseData = response.json();
            if (responseData.success && responseData.data.tokens) {
                pm.collectionVariables.set('authToken', responseData.data.tokens.accessToken);
                pm.collectionVariables.set('refreshToken', responseData.data.tokens.refreshToken);
                console.log('✅ Token nuevo obtenido y guardado automáticamente');
            }
        } else {
            console.error('❌ Login falló:', response.json());
        }
    });
}

// 🚀 EJECUTAR LA FUNCIÓN
obtenerTokenAutomatico();

// 📝 INSTRUCCIONES PARA USAR:
// 1. Copia este script completo
// 2. Pégalo en el Pre-request Script de cualquier endpoint que necesite autenticación
// 3. El script verificará automáticamente si necesita un token nuevo
// 4. Solo hará login si el token actual está expirado o es inválido

// 🎯 BENEFICIOS:
// - Evita logins innecesarios
// - Maneja automáticamente la expiración de tokens
// - Reduce el tiempo de respuesta de las pruebas
// - Funciona de forma transparente
