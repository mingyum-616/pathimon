import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { mountGlobalControls } from './ui/globalControls';

const game = new Phaser.Game(createGameConfig('game'));
mountGlobalControls(game);
