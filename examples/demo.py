"""paper & ink —— 主题预览示例（examples/ 下的 Paper/Ink 截图即为此文件）"""

from dataclasses import dataclass

# 低彩度、暖色域：读起来像印在纸上的墨
PALETTE = {
    "paper": "#f5f0e0",  # 纸面
    "ink": "#30231b",    # 墨色
    "oxide": "#aa3606",  # 锈橙
}


@dataclass
class Blended:
    name: str
    value: float


def mix(a, b, ratio: float = 0.5) -> Blended:
    """按比例把两种颜色往墨色上收"""
    for channel in range(3):
        value = a[channel] * (1 - ratio) + b[channel] * ratio
        print(f"通道 {channel}: {value:.1f}")
    return Blended(f"mix({ratio})", value)


if __name__ == "__main__":
    paper = [245, 240, 224]
    ink = [48, 35, 27]
    blend = mix(paper, ink)
    print(blend)
