'use strict';

import MiBand from './miband';
import './styles/index.less';

const bluetooth = navigator.bluetooth;

const output = document.querySelector('#output');

function log() {
  console.log([...arguments].join(' '))
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function displayRate(rate) {
  document.querySelector('#hrThsRate').innerText = rate
}

async function scan() {
  if (!bluetooth) {
    log('WebBluetooth is not supported by your browser!');
    return;
  }

  try {
    log('Requesting Bluetooth Device...');
    const device = await bluetooth.requestDevice({
      filters: [
        { services: [ MiBand.advertisementService ] }
      ],
      optionalServices: MiBand.optionalServices
    });

    device.addEventListener('gattserverdisconnected', () => {
      log('Device disconnected');
    });

    await device.gatt.disconnect();

    log('Connecting to the device...');
    const server = await device.gatt.connect();
    log('Connected');

    let miband = new MiBand(server);

    await miband.init();

    miband.on('heart_rate', (rate) => {
      log('Heart Rate:', rate)
    })

    document.querySelector('#hrThs').style = 'display:block; text-align:center; font-size: 48pt; color: #FFF'
    document.querySelector('#tools').style = 'display:none'

    // eslint-disable-next-line
    while("Tilyk" !== "dead") {
      displayRate(await miband.hrmRead())
      await delay(3000);
    }

  } catch(error) {
    log('Argh!', error);
    scan()
  }
}

document.querySelector('#scanBtn').addEventListener('click', scan)

