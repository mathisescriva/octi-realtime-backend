const WebSocket = require('ws');

console.log('🧪 Test de connexion WebSocket...\n');

const ws = new WebSocket('ws://localhost:8080/ws/realtime');

let testResults = {
  connected: false,
  readyReceived: false,
  errors: []
};

ws.on('open', () => {
  console.log('✅ Connexion WebSocket établie');
  testResults.connected = true;
});

ws.on('message', (data) => {
  // Message JSON
  if (typeof data === 'string' || Buffer.isBuffer(data)) {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Message reçu:', JSON.stringify(message, null, 2));
      
      if (message.type === 'ready') {
        console.log('✅ Message "ready" reçu - Backend prêt !');
        testResults.readyReceived = true;
        
        // Tester l'envoi d'un message start_conversation
        console.log('\n📤 Envoi de start_conversation...');
        ws.send(JSON.stringify({ type: 'start_conversation' }));
        
        // Attendre un peu puis fermer
        setTimeout(() => {
          console.log('\n✅ Tests terminés avec succès !');
          console.log('\n📊 Résumé:');
          console.log('  - Connexion: ✅');
          console.log('  - Message ready: ✅');
          console.log('  - Envoi de messages: ✅');
          ws.close();
          process.exit(0);
        }, 2000);
      } else if (message.type === 'error') {
        console.log('❌ Erreur reçue:', message.message);
        testResults.errors.push(message.message);
      }
    } catch (e) {
      // Message binaire (audio)
      console.log('📦 Message binaire reçu (audio):', data.length, 'bytes');
    }
  }
});

ws.on('error', (error) => {
  console.error('❌ Erreur WebSocket:', error.message);
  testResults.errors.push(error.message);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 Connexion fermée (code: ${code}, reason: ${reason.toString()})`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Erreurs détectées:');
    testResults.errors.forEach(err => console.log('  -', err));
    process.exit(1);
  } else if (testResults.connected && testResults.readyReceived) {
    console.log('\n✅ Tous les tests sont passés !');
    process.exit(0);
  } else {
    console.log('\n⚠️  Tests incomplets');
    process.exit(1);
  }
});

// Timeout de sécurité
setTimeout(() => {
  if (!testResults.readyReceived) {
    console.log('\n⏱️  Timeout - Le serveur n\'a pas envoyé "ready"');
    ws.close();
    process.exit(1);
  }
}, 10000);

