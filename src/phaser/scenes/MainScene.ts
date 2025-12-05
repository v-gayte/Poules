import Phaser from 'phaser';
import { useGameStore } from '../../stores/useGameStore';
import { ROOMS } from '../../config/gameConfig';
import tilesetImg from '../../assets/CoolSchool_tileset.png';
import levelJsonUrl from '../../assets/poules.json?url';

export class MainScene extends Phaser.Scene {
  private gridSize = 48;
  private unsubscribe: () => void;
  private students: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('MainScene');
    this.unsubscribe = () => {};
  }

  preload() {
    this.load.image('tiles', tilesetImg);
    this.load.tilemapTiledJSON('map', levelJsonUrl);
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a202c');
    
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('CoolSchool_tileset', 'tiles');

    if (tileset) {
        map.layers.forEach((_, index) => {
            map.createLayer(index, tileset, 0, 0);
        });
    }

    // Center camera and zoom out
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    this.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
    this.cameras.main.setZoom(0.5);

    // this.drawGrid(); // Grid is less useful with the full map art, disabling for now or keeping it subtle

    // Subscribe to store changes
    this.unsubscribe = useGameStore.subscribe((state) => {
      this.renderRooms(state.rooms);
      this.updateStudents(state.studentCount);
    });

    // Initial render
    const state = useGameStore.getState();
    this.renderRooms(state.rooms);
    this.updateStudents(state.studentCount);

    // Input handling
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.button === 0) { // Left click for interaction
            const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
            const x = Math.floor(worldPoint.x / this.gridSize);
            const y = Math.floor(worldPoint.y / this.gridSize);
            
            const state = useGameStore.getState();
            
            const room = state.rooms.find(r => {
                const config = ROOMS[r.type as keyof typeof ROOMS];
                return x >= r.x && x < r.x + config.width && y >= r.y && y < r.y + config.height;
            });
            
            if (room) {
                if (room.unlocked) {
                    state.setInspectedRoomId(room.id);
                } else {
                    state.unlockRoom(room.id);
                }
            } else {
                state.setInspectedRoomId(null);
            }
        }
    });

    // Camera Panning
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown) {
            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        }
    });

    // Zoom
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
        const zoom = this.cameras.main.zoom - deltaY * 0.001;
        this.cameras.main.setZoom(Phaser.Math.Clamp(zoom, 0.2, 2));
    });

    // Student Loop
    this.time.addEvent({
        delay: 2000, // Move every 2 seconds
        callback: () => this.moveStudents(mapWidth, mapHeight),
        callbackScope: this,
        loop: true
    });
  }

  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x2d3748, 0.5);

    const width = 4000;
    const height = 4000;

    for (let x = 0; x < width; x += this.gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
    }

    for (let y = 0; y < height; y += this.gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
    }
    graphics.strokePath();
  }

  renderRooms(rooms: any[]) {
    if (!this.sys || !this.sys.isActive()) return;
    this.children.list.filter(child => child.name === 'room').forEach(child => child.destroy());

    rooms.forEach(room => {
      const config = ROOMS[room.type as keyof typeof ROOMS];
      if (!config) return;

      const pixelX = room.x * this.gridSize;
      const pixelY = room.y * this.gridSize;
      const pixelW = config.width * this.gridSize;
      const pixelH = config.height * this.gridSize;

      const rect = this.add.rectangle(
        pixelX + pixelW / 2,
        pixelY + pixelH / 2,
        pixelW - 4,
        pixelH - 4,
        config.color
      );
      rect.setName('room');
      rect.setStrokeStyle(2, 0xffffff);
      rect.setAlpha(room.unlocked ? 1 : 0.3);

      const emoji = this.add.text(
        pixelX + pixelW / 2,
        pixelY + pixelH / 2,
        room.unlocked ? config.emoji : '🔒',
        { fontSize: '32px' }
      );
      emoji.setOrigin(0.5);
      emoji.setName('room');

      const text = this.add.text(
        pixelX + 4,
        pixelY + 4,
        config.name,
        { fontSize: '10px', color: '#ffffff' }
      );
      text.setName('room');
      
      if (!room.unlocked) {
          const costText = this.add.text(
            pixelX + pixelW / 2,
            pixelY + pixelH / 2 + 20,
            `$${room.cost}`,
            { fontSize: '12px', color: '#ffff00' }
          );
          costText.setOrigin(0.5);
          costText.setName('room');
      } else {
          rect.setAlpha(1);
      }
    });
  }

  updateStudents(count: number) {
    if (!this.sys || !this.sys.isActive()) return;
    const visualCount = Math.min(count, 50);
    
    if (this.students.length < visualCount) {
        const toAdd = visualCount - this.students.length;
        for (let i = 0; i < toAdd; i++) {
            const student = this.add.text(0, 0, '🎓', { fontSize: '16px' });
            student.x = Phaser.Math.Between(0, this.scale.width);
            student.y = Phaser.Math.Between(0, this.scale.height);
            this.students.push(student);
        }
    } else if (this.students.length > visualCount) {
        const toRemove = this.students.length - visualCount;
        for (let i = 0; i < toRemove; i++) {
            const student = this.students.pop();
            student?.destroy();
        }
    }
  }

  moveStudents(mapWidth: number, mapHeight: number) {
    this.students.forEach(student => {
        const dx = Phaser.Math.Between(-1, 1) * this.gridSize;
        const dy = Phaser.Math.Between(-1, 1) * this.gridSize;
        
        const newX = student.x + dx;
        const newY = student.y + dy;

        if (newX >= 0 && newX < mapWidth && newY >= 0 && newY < mapHeight) {
            this.tweens.add({
                targets: student,
                x: newX,
                y: newY,
                duration: 1000,
                ease: 'Linear'
            });
        }
    });
  }

  destroy() {
    this.unsubscribe();
  }
}
