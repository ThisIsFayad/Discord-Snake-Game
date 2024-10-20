"use strict";

export class Snake {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.score = 0;
        this.snake = [{ x: Math.floor(w / 2), y: Math.floor(h / 2) }];
        this.apple = this.get_apple();
        this.direction = { x: 0, y: 0 };
        this.begin = false;
        this.gameover = false;
        this.directions = {
            left: { x: 0, y: -1 },
            right: { x: 0, y: 1 },
            up: { x: -1, y: 0 },
            down: { x: 1, y: 0 },
        };

        this.make_grid();
    }

    make_grid() {
        this.grid = [];
        for (let i = 0; i < this.h; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.w; j++) {
                let symbol = ":white_large_square:";
                if (this.snake.some((p) => p.x == i && p.y == j)) symbol = ":green_square:";
                if (i == this.snake[0].x && j == this.snake[0].y) symbol = ":green_circle:";
                if (i == this.apple.x && j == this.apple.y) symbol = ":apple:";
                this.grid[i].push(symbol);
            }
        }
    }

    get_grid() {
        return this.grid.map((row) => row.join("")).join("\n");
    }

    get_apple() {
        let apple = {
            x: Math.floor(Math.random() * this.h),
            y: Math.floor(Math.random() * this.w),
        };

        while (this.snake.some((p) => p.x == apple.x && p.y == apple.y)) {
            apple = {
                x: Math.floor(Math.random() * this.h),
                y: Math.floor(Math.random() * this.w),
            };
        }

        return apple;
    }

    opposite_direction(new_direction) {
        return this.direction.x + new_direction.x === 0 && this.direction.y + new_direction.y === 0;
    }

    move() {
        if (!this.direction || this.gameover) return;

        let head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        // wrap snake at wall edges
        head.x = (head.x + this.h) % this.h;
        head.y = (head.y + this.w) % this.w;

        // snake ate itself
        if (this.snake.some((p) => p.x == head.x && p.y == head.y)) {
            this.gameover = true;
            return;
        }

        this.snake.unshift(head);

        // snake actually ate apple instead of itself
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score++;
            if (this.snake.length != this.w * this.h) this.apple = this.get_apple();
        } else {
            this.snake.pop(); // remove tail
        }

        if (this.snake.length == this.w * this.h) this.gameover = true;

        this.make_grid();
    }

    change_direction(new_direction) {
        this.begin = true;
        if (!this.opposite_direction(new_direction)) {
            this.direction = new_direction;
        }
    }
}