const WebSocket = require('ws');

console.log('🧪 Test simple de connexion\n');

const ws = new WebSocket('ws://localhost:8080/ws/realtime');

ws.on('open', () => {
  console.log('✅ Connecté au backend');
  console.log('📤 Envoi de start_conversation...');
  ws.send(JSON.stringify({ type: 'start_conversation' }));
});

ws.on('message', (data) => {
  if (typeof data === 'string') {
    const msg = JSON.parse(data);
    console.log('📨 Reçu:', msg);
    
    if (msg.type === 'ready') {
      console.log('\n✅ Backend prêt !');
      console.log('\n💡 Pour tester avec de l\'audio réel, utilisez votre frontend.');
      console.log('   Le backend attend des chunks audio PCM16.');
      setTimeout(() => ws.close(), 1000);
    }
  } else {
    console.log('📦 Audio reçu:', data.length, 'bytes');
  }
});

ws.on('error', (err) => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('\n⏱️  Timeout');
  process.exit(0);
}, 5000);
