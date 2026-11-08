// --- КОНФИГУРАЦИЯ И СОСТОЯНИЕ ---
const POINTS = [{x:15,y:15},{x:40,y:15},{x:65,y:15},{x:15,y:40},{x:40,y:40},{x:65,y:40},{x:15,y:65},{x:40,y:65},{x:65,y:65}];
const CYCLE_TIME = 128; 
const TOTAL_DECRYPT_TIME = 110; 
const CYRILLIC = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

let signalDisplay = 98;
let signalTarget = 98;
let nextSignalUpdate = 0;
let isSignalLoss = false;
let lastStatusText = "";
let packetDisplay = "0x" + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
let nextPacketAction = Date.now() + 500;
let isPacketStatic = false; 
let channelDisplay = Math.floor(Math.random() * 99 + 1).toString().padStart(2, '0');
let nextChannelUpdate = Date.now() + 5000;

const ERROR_INTERVAL = 7 * 60 * 60 * 1000; 
const ERROR_DURATION = 128 * 1000;