export type IdeaScratchAssetFormat = 'svg' | 'png' | 'webp';

export type IdeaScratchAssetId =
  | 'ideaboard'
  | 'explorer'
  | 'favicon'
  | 'crciberneticaLogo'
  | 'ucenfotecLogo';

export interface IdeaScratchAssetEntry {
  readonly id: IdeaScratchAssetId;
  readonly name: string;
  readonly url: string;
  readonly publicRelativePath: string;
  readonly originalUrl: string;
  readonly format: IdeaScratchAssetFormat;
  readonly width: number;
  readonly height: number;
  readonly unit: 'mm' | 'px';
  readonly viewBox?: string;
  readonly aspectRatio: number;
  readonly renderedCssWidthPx: number;
  readonly renderedCssHeightPx: number;
  readonly bytes: number;
  readonly sha256: string;
}

export interface IdeaBoardOverlaySpec {
  readonly domId: string;
  readonly kind: 'neopixel' | 'boot-button' | 'motor' | 'servo' | 'analog' | 'digital';
  readonly ideascratchPin: string;
  readonly specPinId?: string;
  readonly side?: 'left' | 'right' | 'center';
  readonly topPct: number;
  readonly leftPct: number;
  readonly widthPct?: number;
  readonly heightPct?: number;
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly zIndex: number;
}

export interface IdeaBoardNormalizedPinGroup {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly xMm: readonly number[];
  readonly yMm: readonly number[];
  readonly xPct: readonly number[];
  readonly yPct: readonly number[];
  readonly note: string;
}

export interface ExplorerMatrixLedSpec {
  readonly index: number;
  readonly x: 0 | 1 | 2 | 3 | 4;
  readonly y: 0 | 1 | 2 | 3 | 4;
  readonly pathId: string;
  readonly viewBoxX: number;
  readonly viewBoxY: number;
  readonly viewBoxWidth: number;
  readonly viewBoxHeight: number;
  readonly centerPctX: number;
  readonly centerPctY: number;
}

export interface ExplorerButtonHitboxSpec {
  readonly domId: string;
  readonly index: 0 | 1 | 2;
  readonly label: 'Button A' | 'Button B' | 'Button C';
  readonly topPct: number;
  readonly leftPct: number;
  readonly widthPct: number;
  readonly heightPct: number;
  readonly zIndex: number;
}

export type IdeaScratchExampleSection =
  | 'Basics'
  | 'Sumobot'
  | 'SumoBot v2'
  | 'IdeaSense Explorer'
  | 'IoT'
  | 'Dashboard';

export interface IdeaScratchOfficialExample {
  readonly section: IdeaScratchExampleSection;
  readonly key: string;
  readonly label: string;
  readonly file: string;
  readonly url: string;
  readonly originalUrl: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly blockCount: number;
  readonly shadowCount: number;
  readonly variableCount: number;
  readonly hasDashboard: boolean;
  readonly dashboardWidgetTypes: readonly string[];
  readonly hasMqtt: boolean;
}

const ORIGIN_SITE = 'https://ideascratch.crcibernetica.com/';
const ASSETS_BASE = `${import.meta.env.BASE_URL}assets/ideascratch/`;

export const IDEASCRATCH_SOURCE_VERSION = 'v4.37';
export const IDEASCRATCH_PROVENANCE_URL = `${ASSETS_BASE}PROVENANCE.json`;
export const IDEASCRATCH_EXAMPLES_MANIFEST_URL = `${ASSETS_BASE}examples/manifest.json`;

export const IDEASCRATCH_DEFAULT_BLOCKS_XML =
  '<xml xmlns="https://developers.google.com/blockly/xml">\n    <block type="controls_forever" x="20" y="20"></block>\n</xml>';

export const IDEASCRATCH_DEFAULT_PYTHON = [
  'import board',
  'from ideaboard import IdeaBoard',
  'from time import sleep',
  '',
  'ib = IdeaBoard()',
  '',
  'while True:',
  '  sleep(0.01)',
].join('\n');

export const IDEASCRATCH_ASSETS: Readonly<Record<IdeaScratchAssetId, IdeaScratchAssetEntry>> = {
  ideaboard: {
    id: 'ideaboard',
    name: 'IdeaBoard Official SVG',
    url: `${ASSETS_BASE}ideaboard.svg`,
    publicRelativePath: 'assets/ideascratch/ideaboard.svg',
    originalUrl: `${ORIGIN_SITE}ideaboard.svg`,
    format: 'svg',
    width: 42.7,
    height: 65.7,
    unit: 'mm',
    viewBox: '0 0 42.7 65.7',
    aspectRatio: 42.7 / 65.7,
    renderedCssWidthPx: 256,
    renderedCssHeightPx: 393.89,
    bytes: 381808,
    sha256: '52055e536006e5815f36f992f0ef116452bab145cc5702b8027e00915801d79b',
  },
  explorer: {
    id: 'explorer',
    name: 'IdeaSense Explorer Official SVG',
    url: `${ASSETS_BASE}explorer.svg`,
    publicRelativePath: 'assets/ideascratch/explorer.svg',
    originalUrl: `${ORIGIN_SITE}explorer.svg`,
    format: 'svg',
    width: 82.224442,
    height: 87.847351,
    unit: 'mm',
    viewBox: '0 0 82.224442 87.847351',
    aspectRatio: 82.224442 / 87.847351,
    renderedCssWidthPx: 256,
    renderedCssHeightPx: 273.51,
    bytes: 261152,
    sha256: '5926aa9afdfdf62f748cd907670ec075a2c5ca3fc2d963d309c921d3393d55eb',
  },
  favicon: {
    id: 'favicon',
    name: 'IdeaScratch Official Favicon',
    url: `${ASSETS_BASE}favicon.png`,
    publicRelativePath: 'assets/ideascratch/favicon.png',
    originalUrl: `${ORIGIN_SITE}favicon.png`,
    format: 'png',
    width: 32,
    height: 32,
    unit: 'px',
    aspectRatio: 1,
    renderedCssWidthPx: 32,
    renderedCssHeightPx: 32,
    bytes: 2010,
    sha256: 'd15b4fe9c49d64ccecf77ddf078b8704cfcfa013c46aed20e14973cc1bb41171',
  },
  crciberneticaLogo: {
    id: 'crciberneticaLogo',
    name: 'CRCibernetica Official Logo',
    url: `${ASSETS_BASE}img/crcibernetica-logo.webp`,
    publicRelativePath: 'assets/ideascratch/img/crcibernetica-logo.webp',
    originalUrl: `${ORIGIN_SITE}img/crcibernetica-logo.webp`,
    format: 'webp',
    width: 508,
    height: 80,
    unit: 'px',
    aspectRatio: 508 / 80,
    renderedCssWidthPx: 508,
    renderedCssHeightPx: 80,
    bytes: 15392,
    sha256: '92c56ce2ec60e54c77976732336f0bca041c2bfa277467ccbbfb3d83b1b798ba',
  },
  ucenfotecLogo: {
    id: 'ucenfotecLogo',
    name: 'Universidad CENFOTEC Official Logo',
    url: `${ASSETS_BASE}img/ucenfotec-logo.png`,
    publicRelativePath: 'assets/ideascratch/img/ucenfotec-logo.png',
    originalUrl: `${ORIGIN_SITE}img/ucenfotec-logo.png`,
    format: 'png',
    width: 250,
    height: 105,
    unit: 'px',
    aspectRatio: 250 / 105,
    renderedCssWidthPx: 250,
    renderedCssHeightPx: 105,
    bytes: 5489,
    sha256: 'fb6d78125b0d90d695ed6938ce66a736264347617beea322ddeeb3d273dce7d2',
  },
};

export const IDEABOARD_SVG_METRICS = {
  url: `${ASSETS_BASE}ideaboard.svg`,
  viewBox: '0 0 42.7 65.7',
  viewBoxWidthMm: 42.7,
  viewBoxHeightMm: 65.7,
  aspectRatio: 42.7 / 65.7,
  proportional260WidthPx: 260,
  proportional260HeightPx: Number(((260 * 65.7) / 42.7).toFixed(2)),
  renderedDesktopWidthPx: 256,
  renderedDesktopHeightPx: 393.89,
  overlayAnchor: 'translate(-50%, -50%)',
  overlays: [
    // Special overlays (4)
    {
      domId: 'sim-pixel',
      kind: 'neopixel',
      ideascratchPin: 'IO02',
      specPinId: 'IO02',
      side: 'center',
      topPct: 52.5,
      leftPct: 49.7,
      widthPx: 22,
      heightPx: 22,
      zIndex: 10,
    },
    {
      domId: 'sim-boot-hitbox',
      kind: 'boot-button',
      ideascratchPin: 'IO0',
      side: 'right',
      topPct: 16.7,
      leftPct: 93.1,
      widthPx: 20,
      heightPx: 32,
      zIndex: 20,
    },
    {
      domId: 'sim-motor1-overlay',
      kind: 'motor',
      ideascratchPin: 'IO12/IO14',
      specPinId: 'MOTOR1_A',
      side: 'right',
      topPct: 38.12,
      leftPct: 90.96,
      widthPct: 5.81,
      heightPct: 7.34,
      zIndex: 10,
    },
    {
      domId: 'sim-motor2-overlay',
      kind: 'motor',
      ideascratchPin: 'IO13/IO15',
      specPinId: 'MOTOR2_A',
      side: 'left',
      topPct: 38.12,
      leftPct: 9.81,
      widthPct: 5.81,
      heightPct: 7.34,
      zIndex: 10,
    },
    // Servo overlays (5, left header)
    {
      domId: 'sim-servo-io4',
      kind: 'servo',
      ideascratchPin: 'IO4',
      specPinId: 'IO04',
      side: 'left',
      topPct: 63.48,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-servo-io5',
      kind: 'servo',
      ideascratchPin: 'IO5',
      specPinId: 'IO05',
      side: 'left',
      topPct: 66.98,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-servo-io18',
      kind: 'servo',
      ideascratchPin: 'IO18',
      specPinId: 'IO18',
      side: 'left',
      topPct: 70.49,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-servo-io19',
      kind: 'servo',
      ideascratchPin: 'IO19',
      specPinId: 'IO19',
      side: 'left',
      topPct: 74.01,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-servo-io23',
      kind: 'servo',
      ideascratchPin: 'IO23',
      specPinId: 'IO23',
      side: 'left',
      topPct: 77.52,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    // Analog overlays (6, right header)
    {
      domId: 'sim-analog-io33',
      kind: 'analog',
      ideascratchPin: 'IO33',
      specPinId: 'IO33',
      side: 'right',
      topPct: 67.17,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-analog-io32',
      kind: 'analog',
      ideascratchPin: 'IO32',
      specPinId: 'IO32',
      side: 'right',
      topPct: 70.67,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-analog-io35',
      kind: 'analog',
      ideascratchPin: 'IO35',
      specPinId: 'IO35',
      side: 'right',
      topPct: 74.17,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-analog-io34',
      kind: 'analog',
      ideascratchPin: 'IO34',
      specPinId: 'IO34',
      side: 'right',
      topPct: 77.67,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-analog-io39',
      kind: 'analog',
      ideascratchPin: 'IO39',
      specPinId: 'IO39',
      side: 'right',
      topPct: 81.18,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    {
      domId: 'sim-analog-io36',
      kind: 'analog',
      ideascratchPin: 'IO36',
      specPinId: 'IO36',
      side: 'right',
      topPct: 84.68,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 10,
    },
    // Digital overlays (14: 7 left + 7 right)
    {
      domId: 'sim-digital-io4',
      kind: 'digital',
      ideascratchPin: 'IO4',
      specPinId: 'IO04',
      side: 'left',
      topPct: 63.48,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io5',
      kind: 'digital',
      ideascratchPin: 'IO5',
      specPinId: 'IO05',
      side: 'left',
      topPct: 66.98,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io18',
      kind: 'digital',
      ideascratchPin: 'IO18',
      specPinId: 'IO18',
      side: 'left',
      topPct: 70.49,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io19',
      kind: 'digital',
      ideascratchPin: 'IO19',
      specPinId: 'IO19',
      side: 'left',
      topPct: 74.01,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io23',
      kind: 'digital',
      ideascratchPin: 'IO23',
      specPinId: 'IO23',
      side: 'left',
      topPct: 77.52,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io25',
      kind: 'digital',
      ideascratchPin: 'IO25',
      specPinId: 'IO25',
      side: 'left',
      topPct: 81.02,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io26',
      kind: 'digital',
      ideascratchPin: 'IO26',
      specPinId: 'IO26',
      side: 'left',
      topPct: 84.55,
      leftPct: 11.69,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io27',
      kind: 'digital',
      ideascratchPin: 'IO27',
      specPinId: 'IO27',
      side: 'right',
      topPct: 63.61,
      leftPct: 88.78,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io33',
      kind: 'digital',
      ideascratchPin: 'IO33',
      specPinId: 'IO33',
      side: 'right',
      topPct: 67.17,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io32',
      kind: 'digital',
      ideascratchPin: 'IO32',
      specPinId: 'IO32',
      side: 'right',
      topPct: 70.67,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io35',
      kind: 'digital',
      ideascratchPin: 'IO35',
      specPinId: 'IO35',
      side: 'right',
      topPct: 74.17,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io34',
      kind: 'digital',
      ideascratchPin: 'IO34',
      specPinId: 'IO34',
      side: 'right',
      topPct: 77.67,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io39',
      kind: 'digital',
      ideascratchPin: 'IO39',
      specPinId: 'IO39',
      side: 'right',
      topPct: 81.18,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
    {
      domId: 'sim-digital-io36',
      kind: 'digital',
      ideascratchPin: 'IO36',
      specPinId: 'IO36',
      side: 'right',
      topPct: 84.68,
      leftPct: 89.15,
      widthPct: 17.03,
      heightPct: 3.5,
      zIndex: 11,
    },
  ] as readonly IdeaBoardOverlaySpec[],
  normalizedPinGroups: [
    {
      id: 'vin-screw-terminal',
      label: 'Vin Screw Terminal (2)',
      count: 2,
      xMm: [10.01, 13.19],
      yMm: [5.26],
      xPct: [23.44, 30.9],
      yPct: [8.01],
      note: 'Y differs ~3.1% vs schematic ideaboardSpec.ts (4.88%)',
    },
    {
      id: 'boot-reset-buttons',
      label: 'BOOT / RESET Buttons (2)',
      count: 2,
      xMm: [39.76],
      yMm: [10.98, 17.53],
      xPct: [93.12],
      yPct: [16.71, 26.68],
      note: 'BOOT (IO0) top, RESET bottom',
    },
    {
      id: 'motor-terminals',
      label: 'Motor Terminals M2 / M1 (4)',
      count: 4,
      xMm: [4.25, 38.9],
      yMm: [23.79, 26.21],
      xPct: [9.95, 91.1],
      yPct: [36.21, 39.9],
      note: 'M2 on left (9.95%), M1 on right (91.10%)',
    },
    {
      id: 'select-jumper',
      label: 'SELECT 3-Pin Jumper (3)',
      count: 3,
      xMm: [21.31],
      yMm: [25.11, 27.3, 29.62],
      xPct: [49.91],
      yPct: [38.21, 41.56, 45.08],
      note: 'Vin / SELECT / +3.3v jumper header',
    },
    {
      id: 'ws2812b-neopixel',
      label: 'WS2812B NeoPixel (IO02)',
      count: 1,
      xMm: [21.22],
      yMm: [34.51],
      xPct: [49.69],
      yPct: [52.53],
      note: 'Onboard RGB NeoPixel on IO02',
    },
    {
      id: 'i2c-header',
      label: 'I2C 4-Pin Header (GND, 3.3v, SCL, SDA)',
      count: 4,
      xMm: [2.61, 4.85, 7.08, 9.31],
      yMm: [38.51],
      xPct: [6.11, 11.36, 16.58, 21.81],
      yPct: [58.62],
      note: 'Left horizontal 4-pin Qwiic/header row',
    },
    {
      id: 'uart-header',
      label: 'UART 4-Pin Header (TX0, RX0, 3.3v, GND)',
      count: 4,
      xMm: [33.44, 35.68, 37.91, 40.15],
      yMm: [38.51],
      xPct: [78.32, 83.56, 88.78, 94.02],
      yPct: [58.62],
      note: 'Right horizontal 4-pin UART header row',
    },
    {
      id: 'left-3x7-header',
      label: 'Left 3x7 GPIO Header (IO04-IO26, 21 pins)',
      count: 21,
      xMm: [2.61, 4.84, 7.07],
      yMm: [41.79, 44.09, 46.39, 48.68, 50.98, 53.28, 55.57],
      xPct: [6.1, 11.34, 16.57],
      yPct: [63.61, 67.11, 70.61, 74.1, 77.6, 81.1, 84.58],
      note: 'Columns: GND, V+, IOxx; schematic ideaboardSpec.ts sits ~4% inward & ~4.5% lower',
    },
    {
      id: 'right-3x7-header',
      label: 'Right 3x7 GPIO Header (IO27-IO36, 21 pins)',
      count: 21,
      xMm: [35.68, 37.91, 40.15],
      yMm: [41.79, 44.09, 46.39, 48.68, 50.98, 53.28, 55.57],
      xPct: [83.55, 88.79, 94.02],
      yPct: [63.61, 67.11, 70.61, 74.1, 77.6, 81.1, 84.58],
      note: 'Columns: IOxx, 3.3v, GND; schematic ideaboardSpec.ts sits ~4% inward & ~4.5% lower',
    },
  ] as readonly IdeaBoardNormalizedPinGroup[],
} as const;

const EXPLORER_VB_W = 82.224442;
const EXPLORER_VB_H = 87.847351;
const LED_W = 1.660008;
const LED_H = 1.579039;
const LED_COL_X = [25.7417, 33.1719, 40.6635, 47.9095, 55.4625] as const;
const LED_ROW_Y = [40.7645, 48.1947, 55.6249, 62.5639, 69.6257] as const;

const EXPLORER_MATRIX_LEDS: readonly ExplorerMatrixLedSpec[] = LED_ROW_Y.flatMap((vy, rowIdx) =>
  LED_COL_X.map((vx, colIdx): ExplorerMatrixLedSpec => {
    const index = rowIdx * 5 + colIdx;
    const cx = vx + LED_W / 2;
    const cy = vy + LED_H / 2;
    return {
      index,
      x: colIdx as 0 | 1 | 2 | 3 | 4,
      y: rowIdx as 0 | 1 | 2 | 3 | 4,
      pathId: `path${34 + 2 * index}`,
      viewBoxX: vx,
      viewBoxY: vy,
      viewBoxWidth: LED_W,
      viewBoxHeight: LED_H,
      centerPctX: Number(((cx / EXPLORER_VB_W) * 100).toFixed(2)),
      centerPctY: Number(((cy / EXPLORER_VB_H) * 100).toFixed(2)),
    };
  })
);

export const EXPLORER_SVG_METRICS = {
  url: `${ASSETS_BASE}explorer.svg`,
  viewBox: `0 0 ${EXPLORER_VB_W} ${EXPLORER_VB_H}`,
  viewBoxWidthMm: EXPLORER_VB_W,
  viewBoxHeightMm: EXPLORER_VB_H,
  aspectRatio: EXPLORER_VB_W / EXPLORER_VB_H,
  renderedDesktopWidthPx: 256,
  renderedDesktopHeightPx: 273.51,
  activeStyle: {
    fill: '#4488ff',
    fillOpacity: '1',
    stroke: '#4488ff',
    strokeWidth: '3.32',
    strokeLinejoin: 'round',
  },
  inactiveStyle: {
    fill: '#b3b3b3',
    fillOpacity: '1',
    stroke: 'none',
    strokeWidth: '',
  },
  matrixLeds: EXPLORER_MATRIX_LEDS,
  buttonAnchor: 'top-left',
  buttons: [
    {
      domId: 'sim-explorer-btn-a',
      index: 0,
      label: 'Button A',
      topPct: 86.8,
      leftPct: 26.42,
      widthPct: 11.65,
      heightPct: 7.52,
      zIndex: 20,
    },
    {
      domId: 'sim-explorer-btn-b',
      index: 1,
      label: 'Button B',
      topPct: 86.8,
      leftPct: 44.34,
      widthPct: 11.65,
      heightPct: 7.52,
      zIndex: 20,
    },
    {
      domId: 'sim-explorer-btn-c',
      index: 2,
      label: 'Button C',
      topPct: 86.8,
      leftPct: 61.07,
      widthPct: 11.65,
      heightPct: 7.52,
      zIndex: 20,
    },
  ] as readonly ExplorerButtonHitboxSpec[],
} as const;

function ex(
  section: IdeaScratchExampleSection,
  key: string,
  label: string,
  file: string,
  bytes: number,
  sha256: string,
  blockCount: number,
  shadowCount: number,
  variableCount: number,
  hasDashboard: boolean,
  dashboardWidgetTypes: readonly string[],
  hasMqtt: boolean
): IdeaScratchOfficialExample {
  return {
    section,
    key,
    label,
    file,
    url: `${ASSETS_BASE}examples/${file}`,
    originalUrl: `${ORIGIN_SITE}examples/${file}`,
    bytes,
    sha256,
    blockCount,
    shadowCount,
    variableCount,
    hasDashboard,
    dashboardWidgetTypes,
    hasMqtt,
  };
}

export const IDEASCRATCH_OFFICIAL_EXAMPLES: readonly IdeaScratchOfficialExample[] = [
  ex('Basics', 'blink', 'Blink', 'blink.iss', 1006, '45de7fa8f7a4ed63495da47ed0f2252909059fc2b1e132cfddd2107aaca079a3', 7, 0, 0, false, [], false),
  ex('Basics', 'digitalIn', 'Digital In', 'digitalIn.iss', 1059, '0f2e64f7ae390dbccd81a3f9a2090c3c13d9036a269a4580b4138b21764e8554', 6, 0, 1, false, [], false),
  ex('Basics', 'digitalOut', 'Digital Out', 'digitalOut.iss', 1531, '6e049c39eb2b0944472d02880556450758a0514d93e98f4db245b098eee58f35', 8, 0, 1, false, [], false),
  ex('Basics', 'analogIn', 'Analog In', 'analogIn.iss', 1020, 'a7a42f2b3407865630d224ecbaeb787eea273c86eae0525b9f1f71f01b104577', 6, 0, 1, false, [], false),
  ex('Basics', 'pixel', 'Pixel', 'pixel.iss', 1553, 'ba820f512b313065ac78bbe2a38d47571d87b48f19adc157537d2e0d764a440e', 10, 0, 0, false, [], false),
  ex('Basics', 'rainbow', 'Rainbow', 'rainbow.iss', 1348, '19cdaac92b6691bc3d88885a8b41be3530937819dff245bd36490aa5f599173a', 9, 0, 1, false, [], false),
  ex('Basics', 'motors', 'Motors', 'motors.iss', 3276, '7126057008135bfaef8bf2aa0896bec3b3e60eb2f78d7f7abdfdb00ed9823123', 21, 0, 0, false, [], false),
  ex('Basics', 'servo', 'Servo', 'servo.iss', 1717, '8186cb3783c7f51f7c733552d2d2a4248b11c9eacf0dc7ea18d14c46c70351fc', 10, 0, 1, false, [], false),
  ex('Basics', 'dataLogging', 'Data Logging', 'dataLogging.iss', 1798, '28205071393d2fa751caa9b0560978fcca334db1a858db0e73b144fbead90cbf', 9, 2, 1, false, [], false),
  ex('Basics', 'bootButton', 'Boot Button', 'bootButton.iss', 1685, '05a85762cceaa8d90b5f19b2836c8be6c3f6f1cace7da4dd92b5002b7f0fe418', 9, 2, 0, false, [], false),
  ex('Sumobot', 'accelGyro', 'Accel/Gyro', 'accelGyro.iss', 3483, 'a0d60405b3dc03fd93a58716faad52f9cb6345431aa6ff84f7d49a895160cde4', 16, 0, 1, false, [], false),
  ex('Sumobot', 'pidMotion', 'PID Motion', 'pidMotion.iss', 2065, '8088c9ec18186fe3a674e62678bbaa11197c8865101f1ca5149494ae5e6972d8', 7, 4, 2, false, [], false),
  ex('Sumobot', 'infrared', 'Infrared', 'infrared.iss', 2092, '87703f67f5074c6d51e5d5a976f7c03e9822b319094c1d35b30f48bec8a27670', 12, 0, 0, false, [], false),
  ex('Sumobot', 'ultrasonic', 'Ultrasonic', 'ultrasonic.iss', 1075, '97839f2b6661d89fcbbd73e97df8a323516961b4b18bc880d701a49496b2a93d', 6, 0, 1, false, [], false),
  ex('Sumobot', 'sumoBatalla01', 'Sumo Batalla 01', 'sumoBatalla01.iss', 12672, '77a2fcc71a966c9256a157ef3fb8f780e31b343e855e16e88c91698f7f682322', 74, 14, 6, true, ['line-graph'], true),
  ex('Sumobot', 'sumoBatalla02', 'Sumo Batalla 02', 'sumoBatalla02.iss', 13777, '1a05abcc707e11fa561b505763a6b2449fa43b97e88c0d9eec661a519468e464', 81, 16, 4, true, ['button', 'slider', 'toggle'], true),
  ex('SumoBot v2', 'sumov2Color', 'Read Color', 'sumov2Color.iss', 4956, '708f81dfe758e5fd7d60b07504b9ee0368b8cefc30ae1ed2fd1b47bbfc92ce4f', 20, 0, 2, false, [], false),
  ex('SumoBot v2', 'sumov2Infrared', 'Infrared', 'sumov2Infrared.iss', 1005, '9f68978eab3c9a35c735a2f8b71de95027cb891dc504e9153f76e5cecdc65e67', 6, 0, 1, false, [], false),
  ex('SumoBot v2', 'sumov2AccelGyro', 'Accel/Gyro', 'sumov2AccelGyro.iss', 4204, '4ffed926df52859b1244bba6685296bcc8f9d9c5654d9f2cfaf47f65eef9d99f', 20, 0, 1, false, [], false),
  ex('SumoBot v2', 'sumov2Detector', 'Light Detector', 'sumov2Detector.iss', 997, 'c0bdbb4db27c7abb26e65e956a8e45ea554f47475a1154b047f7c30930f85b91', 6, 0, 1, false, [], false),
  ex('SumoBot v2', 'sumov2Led', 'LED', 'sumov2Led.iss', 4013, '333f1adb28474cb684fb9ccb8e09aa0fd6be960561c0c4fde3ed3821ad3705f0', 20, 0, 1, false, [], false),
  ex('IdeaSense Explorer', 'accelPointer', 'Accel Pointer', 'accelPointer.iss', 6823, 'ff3d73c24e5b43b74fec5f62dfb00c4acc963d577eb7a33270adb05c9613e905', 35, 0, 3, false, [], false),
  ex('IdeaSense Explorer', 'textDemo', 'Text Demo', 'textDemo.iss', 3646, 'f8f2e536a6726ae83b1794440a4439ad27a74efb8b76eb0e6f1b9a854b2e5e64', 14, 7, 0, false, [], false),
  ex('IdeaSense Explorer', 'weather', 'Weather', 'weather.iss', 4593, '8622d65fcb67b026cb3238b3edf05869e7ddd68af0fff122a16ad73091ae1ba5', 22, 2, 0, false, [], false),
  ex('IdeaSense Explorer', 'simple', 'Simple', 'simple.iss', 5486, 'dbebbe8b1c1a0a4b110330a427d92b26f65cffead35ac1aa8bd93d90c59048f0', 25, 5, 0, false, [], false),
  ex('IoT', 'mqtt_receive', 'MQTT Receive', 'mqtt_receive.iss', 2589, 'a5b4144aa0df7c49154a35f9b59dc3d7126f9246bd8733804cd83d6b337325cb', 10, 1, 1, true, ['text-input'], true),
  ex('IoT', 'mqtt_send', 'MQTT Send', 'mqtt_send.iss', 2173, '74829ba16f59465a93297c6b5f6ef81ae1c19f2abb2cfa317a0827e282124ad6', 5, 5, 1, true, ['line-graph'], true),
  ex('Dashboard', 'serial_graph', 'Serial Graph', 'serial_graph.iss', 1325, '6f7bcfafe6a61065a2f811b49627b9cad92e9cb45d4edcf04148370bef2bb3fe', 4, 4, 0, true, ['line-graph'], true),
  ex('Dashboard', 'serial_receive', 'Serial Receive from Dashboard', 'serial_receive.iss', 1794, '17913db062e182377aac6733c5fcf643f57fb998c8c44fd805a72cd468ddb1c5', 8, 0, 0, true, ['button', 'slider', 'toggle'], true),
  ex('Dashboard', 'joystick', 'Joystick', 'joystick.iss', 7004, '2678d62279e569a3eb9ed774597a2bda07326efb470e72f905f458bbd308539b', 39, 20, 0, true, ['joystick'], true),
];
