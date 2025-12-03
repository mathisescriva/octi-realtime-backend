const WebSocket = require('ws');

console.log('🧪 Test complet du backend OCTI Realtime\n');
console.log('='.repeat(50));

const ws = new WebSocket('ws://localhost:8080/ws/realtime');

let testResults = {
  connected: false,
  readyReceived: false,
  startConversationSent: false,
  userAudioEndSent: false,
  errors: []
};

let messageCount = 0;

ws.on('open', () => {
  console.log('✅ Connexion WebSocket établie');
  testResults.connected = true;
});

ws.on('message', (data) => {
  messageCount++;
  
  // Message JSON
  if (typeof data === 'string' || Buffer.isBuffer(data)) {
    try {
      const message = JSON.parse(data.toString());
      console.log(`\n📨 Message #${messageCount} reçu:`, JSON.stringify(message, null, 2));
      
      if (message.type === 'ready') {
        console.log('✅ Message "ready" reçu - Backend prêt !');
        testResults.readyReceived = true;
        
        // Tester l'envoi d'un message start_conversation
        console.log('\n📤 Envoi de start_conversation...');
        ws.send(JSON.stringify({ type: 'start_conversation' }));
        testResults.startConversationSent = true;
        
        // Simuler l'envoi d'un chunk audio (vide pour le test)
        setTimeout(() => {
          console.log('\n📤 Envoi d\'un chunk audio simulé (29 bytes)...');
          const fakeAudio = Buffer.alloc(29, 0);
          ws.send(fakeAudio);
          
          // Envoyer user_audio_end
          setTimeout(() => {
            console.log('\n📤 Envoi de user_audio_end...');
            ws.send(JSON.stringify({ type: 'user_audio_end' }));
            testResults.userAudioEndSent = true;
            
            // Attendre la réponse puis fermer
            setTimeout(() => {
              console.log('\n✅ Tests terminés !');
              printSummary();
              ws.close();
            }, 3000);
          }, 500);
        }, 500);
      } else if (message.type === 'error') {
        console.log('❌ Erreur reçue:', message.message);
        testResults.errors.push(message.message);
      } else if (message.type === 'transcript_delta') {
        console.log('📝 Transcription delta:', message.text);
      } else if (message.type === 'bot_audio_end') {
        console.log('🔊 Fin de l\'audio du bot');
      }
    } catch (e) {
      // Message binaire (audio)
      console.log(`\n📦 Message binaire #${messageCount} reçu (audio):`, data.length, 'bytes');
    }
  }
});

ws.on('error', (error) => {
  console.error('❌ Erreur WebSocket:', error.message);
  testResults.errors.push(error.message);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 Connexion fermée (code: ${code}, reason: ${reason.toString()})`);
  printSummary();
  
  if (testResults.errors.length > 0) {
    process.exit(1);
  } else if (testResults.connected && testResults.readyReceived) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(50));
  console.log('  ✅ Connexion WebSocket:', testResults.connected ? 'OK' : '❌');
  console.log('  ✅ Message ready:', testResults.readyReceived ? 'OK' : '❌');
  console.log('  ✅ Start conversation:', testResults.startConversationSent ? 'OK' : '❌');
  console.log('  ✅ User audio end:', testResults.userAudioEndSent ? 'OK' : '❌');
  console.log('  📨 Messages reçus:', messageCount);
  
  if (testResults.errors.length > 0) {
    console.log('\n  ❌ Erreurs:');
    testResults.errors.forEach(err => console.log('    -', err));
  } else {
    console.log('\n  ✅ Aucune erreur détectée');
  }
  console.log('='.repeat(50));
}

// Timeout de sécurité
setTimeout(() => {
  if (!testResults.readyReceived) {
    console.log('\n⏱️  Timeout - Le serveur n\'a pas envoyé "ready"');
    printSummary();
    ws.close();
    process.exit(1);
  }
}, 15000);

