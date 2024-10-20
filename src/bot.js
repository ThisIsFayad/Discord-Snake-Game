import "dotenv/config";
import { Snake } from "./snake.js";
import {
    Client,
    GatewayIntentBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";

// Create a discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let games = {};
let sizes = {
    small: 5,
    medium: 7,
    large: 9,
};

client.once("ready", () => {
    console.log("Bot is online!");
    client.application.commands.create({
        name: "play",
        description: "play snake!",
        options: [
            {
                name: "size",
                description: "The size of the grid",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "Small",
                        value: "small",
                    },
                    {
                        name: "Medium",
                        value: "medium",
                    },
                    {
                        name: "Large",
                        value: "large",
                    },
                ],
            },
        ],
    });
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "play") {
            const userId = interaction.user.id;
            const { options } = interaction;
            let size = sizes[options._hoistedOptions[0].value];

            // Initialize a new Snake game for the user
            const snake = new Snake(size, size);
            games[userId] = { snake, interval: null };

            // Create buttons
            const buttons_up = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("up").setLabel("Up").setStyle(ButtonStyle.Secondary)
            );
            const buttons_left_right = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("left")
                    .setLabel("Left")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("right")
                    .setLabel("Right")
                    .setStyle(ButtonStyle.Secondary)
            );
            const buttons_down = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("down")
                    .setLabel("Down")
                    .setStyle(ButtonStyle.Secondary)
            );

            const buttons_end = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("end")
                    .setLabel("End Game")
                    .setStyle(ButtonStyle.Danger)
            );

            // Send message with buttons
            const sentMessage = await interaction.reply({
                content: `Score: ${snake.score}\n${snake.get_grid()}`,
                components: [buttons_up, buttons_left_right, buttons_down, buttons_end],
                fetchReply: true,
            });

            // Game loop
            const gameInterval = setInterval(async () => {
                if (!snake.gameover && snake.begin) {
                    snake.move();
                    await sentMessage.edit({
                        content: `Score: ${snake.score}\n${snake.get_grid()}`,
                    });
                } else if (snake.begin) {
                    await sentMessage.edit({
                        content: `Game Over!\nFinal Score: ${snake.score}\n${snake.get_grid()}`,
                    });
                    clearInterval(gameInterval);
                    delete games[userId]; // Clean up user game state
                }
            }, 1150);

            games[userId].interval = gameInterval;
        }
    }

    // Button interaction handling
    if (interaction.isButton()) {
        const userId = interaction.user.id;
        const game = games[userId]; // Retrieve the user game state

        if (game) {
            const snake = game.snake;
            if (interaction.customId == "end") {
                snake.gameover = true; // end game
            } else {
                snake.change_direction(snake.directions[interaction.customId]);
            }
            await interaction.deferUpdate();
        } else {
            await interaction.reply({
                content: "You don't have an active game. Use `/play` to start a new one!",
                ephemeral: true,
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
