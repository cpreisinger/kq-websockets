const config = {};

config.kq_protocol = "ws";
config.kq_host = "localhost";
config.kq_port = "12749";
config.client_protocol = "wss";
config.client_host = "bmorekq.ddns.net";
config.client_port = "";

config.keep_alive_interval = 5000;

config.scene_name = "Baltimore";
config.scene_code = "BMORE";
config.scene_token = "test_token12345";

module.exports = config;
