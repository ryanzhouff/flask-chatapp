import eventlet

eventlet.monkey_patch()
import random
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit


# 保存已连接的用户，key是socket id，值是username和avatar url
# 模拟数据库
connected_users = {}

app = Flask(__name__)
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")


# 监听连接事件
@socketio.on("connect")
def handle_connect():
    username = f"User_{random.randint(1000, 9999)}"
    # 生成随机的头像
    gender = random.choice(["girl", "body"])
    avatar_url = f" https://avatar.iran.liara.run/public/{gender}?username={username}"

    connected_users[request.sid] = {"username": username, "avatar": avatar_url}

    # 以广播的形式通知其他用户有用户连接
    emit("user_joined", {"username": username, "avatar": avatar_url}, broadcast=True)
    emit("set_username", {"username": username})


@socketio.on("disconnect")
def handle_disconnect():
    # 从数据库中删除退出连接的用户
    user = connected_users.pop(request.sid, None)
    if user:
        emit("user_left", {"username": user["username"]}, broadcast=True)


@socketio.on("send_message")
def handle_message(data):
    user = connected_users.get(request.sid, None)
    if user:
        emit(
            "new_message",
            {
                "username": user["username"],
                "avatar": user["avatar"],
                "message": data["message"],
            },
            broadcast=True,
        )


@socketio.on("update_username")
def handle_update_username(data):
    old_username = connected_users[request.sid]["username"]
    new_username = data["username"]
    connected_users[request.sid]["username"] = new_username

    emit(
        "username_updated",
        {"new_username": new_username, "old_username": old_username},
        broadcast=True,
    )


if __name__ == "__main__":
    socketio.run(app)
