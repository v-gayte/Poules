import Phaser from 'phaser';
import { useGameStore } from '../../stores/useGameStore';
import { ROOMS } from '../../config/gameConfig';
import tilesetImg from '../../assets/CoolSchool_tileset.png';
import student1Img from '../../assets/StudentModels/New_Piskel-1.png.png';
import student2Img from '../../assets/StudentModels/New_Piskel-2.png.png';
import student3Img from '../../assets/StudentModels/New_Piskel-3.png.png';
import levelJsonUrl from '../../assets/poules.json?url';

export class MainScene extends Phaser.Scene {
  private gridSize = 48;
  private unsubscribe: () => void;
  private students: Phaser.GameObjects.Sprite[] = [];


  constructor() {
    super('MainScene');
    this.unsubscribe = () => { };
  }

  preload() {
    this.load.image('tiles', tilesetImg);
    this.load.image('student1', student1Img);
    this.load.image('student2', student2Img);
    this.load.image('student3', student3Img);
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
    this.cameras.main.centerOn(2315, 2000);
    this.cameras.main.setZoom(0.20);

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
          // Check if point is within x1 (inclusive) and x2 (exclusive? or inclusive?)
          // Usually x2 is "bottom right corner", so width = x2 - x1.
          // Let's assume user inputs inclusive coords or bounding box.
          // If the user says "coordinate top left and bottom right to take whole room",
          // typically that means the area FROM x1 TO x2.
          // Let's interpret width = x2 - x1, so x2 is exclusive bound, or x2 is the index of the last tile?
          // If x1=0, x2=1, is it 1 tile wide? Yes if x2 is exclusive or width.
          // "Point en bas à droite" implies inclusive usually.
          // Let's assume inclusive range for tiles: x >= x1 && x <= x2 ?
          // But gameConfig replaced structure implied x2 as a coordinate.
          // Let's assume x2, y2 is the coordinate of the last tile INCLUDED.
          // Then width in tiles = x2 - x1 + 1.
          
          return x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2;
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
      delay: 2000,
      callback: () => this.moveStudents(mapWidth, mapHeight),
      callbackScope: this,
      loop: true
    });


  }

  drawGrid() {
     // Removed grid logic
  }

  renderRooms(rooms: any[]) {
    if (!this.sys || !this.sys.isActive()) return;
    this.children.list.filter(child => child.name === 'room').forEach(child => child.destroy());

    rooms.forEach(room => {
      const config = ROOMS[room.type as keyof typeof ROOMS];
      if (!config) return;

      // Calculate dimensions from x1, y1, x2, y2
      // Assuming inclusive coordinates: width = (x2 - x1 + 1) * gridSize
      // Assuming x,y (top-left) = x1 * gridSize
      
      const widthInTiles = (room.x2 - room.x1 + 1);
      const heightInTiles = (room.y2 - room.y1 + 1);

      const pixelX = room.x1 * this.gridSize;
      const pixelY = room.y1 * this.gridSize;
      const pixelW = widthInTiles * this.gridSize;
      const pixelH = heightInTiles * this.gridSize;

      const rect = this.add.rectangle(
        pixelX + pixelW / 2,
        pixelY + pixelH / 2,
        pixelW - 4,
        pixelH - 4,
        config.color
      );
      rect.setName('room');
      rect.setStrokeStyle(2, 0xffffff);
      
      // If unlocked, fill is transparent (0) to see tiles.
      // If locked, fill is semi-transparent (0.3).
      rect.setFillStyle(config.color, room.unlocked ? 0 : 0.3);

      if (!room.unlocked) {
        const emoji = this.add.text(
            pixelX + pixelW / 2,
            pixelY + pixelH / 2,
            '🔒',
            { fontSize: '32px' }
        );
        emoji.setOrigin(0.5);
        emoji.setName('room');
      }

      // Only show text/emoji if locked? Or always?
      // User said "la case devienne transparente". Usually implies seeing the tiles.
      // Maybe we hide the emoji too if it covers the tiles?
      // But we need to know what room it is.
      // Let's keep the emoji/text for now, just transparent background.
      
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
        // Unlocked: transparent background, but keep border/text
        // rect.setAlpha(1); // Removed matching redundant logic
      }
    });
  }

  updateStudents(count: number) {
    if (!this.sys || !this.sys.isActive()) return;
    const visualCount = Math.min(count, 50);

    if (this.students.length < visualCount) {
        const toAdd = visualCount - this.students.length;
        for (let i = 0; i < toAdd; i++) {
            // Pick random student texture
            const textureKey = Phaser.Utils.Array.GetRandom(['student1', 'student2', 'student3']);
            const student = this.add.sprite(0, 0, textureKey);
            
            student.x = Phaser.Math.Between(0, this.scale.width); 
            student.setDepth(10); // Above rooms

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
