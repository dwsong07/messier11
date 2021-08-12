module.exports = {
    apps: [
        {
            name: "messier11",
            script: "./build/src",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
