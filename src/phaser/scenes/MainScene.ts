import Phaser from 'phaser';
import { useGameStore } from '../../stores/useGameStore';
import { ROOMS } from '../../config/gameConfig';

export class MainScene extends Phaser.Scene {
  private gridSize = 48;
  private unsubscribe: () => void;
  private students: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('MainScene');
    this.unsubscribe = () => {};
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a202c');
    this.drawGrid();

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
        const x = Math.floor(pointer.worldX / this.gridSize);
        const y = Math.floor(pointer.worldY / this.gridSize);
        
        const state = useGameStore.getState();
        
        const room = state.rooms.find(r => {
            const config = ROOMS[r.type];
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
    });

    // Student Loop
    this.time.addEvent({
        delay: 2000, // Move every 2 seconds
        callback: this.moveStudents,
        callbackScope: this,
        loop: true
    });
  }

  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x2d3748, 0.5);

    const width = this.scale.width;
    const height = this.scale.height;

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
      const config = ROOMS[room.type];
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
          // Check if this room was just unlocked (simple check: if it has no tween yet?)
          // For now, just ensuring unlocked rooms are full alpha
          rect.setAlpha(1);
      }
    });
  }

  updateStudents(count: number) {
    if (!this.sys || !this.sys.isActive()) return;
    // Simple logic: If count > current, add. If count < current, remove.
    // For performance, cap visual students at say 50.
    const visualCount = Math.min(count, 50);
    
    if (this.students.length < visualCount) {
        const toAdd = visualCount - this.students.length;
        for (let i = 0; i < toAdd; i++) {
            const student = this.add.text(0, 0, '🎓', { fontSize: '16px' });
            // Random start pos
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

  moveStudents() {
    this.students.forEach(student => {
        // Random walk
        const dx = Phaser.Math.Between(-1, 1) * this.gridSize;
        const dy = Phaser.Math.Between(-1, 1) * this.gridSize;
        
        this.tweens.add({
            targets: student,
            x: student.x + dx,
            y: student.y + dy,
            duration: 1000,
            ease: 'Linear'
        });
    });
  }

  destroy() {
    this.unsubscribe();
  }
}
