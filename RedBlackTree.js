const layerOffstY = 70
const layerOffsetBaseX = 300
const layerOffsetRatioX = 40

class Node {
  constructor(key, value) {
    // 默认为红色
    this.color = 'red'
    this.key = key
    this.value = value
    this.parent = null
    this.left = null
    this.right = null
  }

  isRed() {
    return this.color === 'red'
  }

  isBlack() {
    return this.color === 'black'
  }

  setBlack() {
    this.color = 'black'
  }

  setRed() {
    this.color = 'red'
  }

  setColor(color) {
    this.color = color
  }

  toggleColor() {
    if (this.isRed()) {
      this.color = 'black'
    } else {
      this.color = 'red'
    }
  }

  // 交换颜色
  swapColor(node) {
    let temp = node.color
    node.color = this.color
    this.color = temp
  }

  toggleDrawBgFillStyle() {
    if (this.isRed()) {
      ctx.fillStyle = "#F30"
    } else {
      ctx.fillStyle = "#333"
    }
  }

  // 获取子树的宽度
  getChildWidth() {
    let leftWidth = 0
    let righgWidth = 0

    if (this.left) {
      leftWidth = this.left.getChildWidth()
    }
    if (this.right) {
      righgWidth = this.right.getChildWidth()
    }

    return leftWidth + righgWidth
  }

  drawLine(ctx, startX, startY, endX, endY) {
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }

  draw(ctx, x, y) {
    this.toggleDrawBgFillStyle()
    ctx.beginPath()
    ctx.arc(x, y, 25, 0, 2 * Math.PI, true)
    ctx.fill()

    // 绘制key文字
    ctx.font = "16px serif";
    ctx.fillStyle = "#fff"
    let text = ctx.measureText(this.key)
    ctx.fillText(this.key, x - text.width / 2, y + 6)
  }
}

let sharedNullNode = new Node(null, null)
sharedNullNode.setBlack()

class RedBlackTree {
  constructor() {
    this.root = sharedNullNode
  }

  // 搜索
  search(key) {
    let x = this.root
    while (x !== sharedNullNode && x.key !== key) {
      if (key < x.key) {
        x = x.left
      } else {
        x = x.right
      }
    }

    return x === sharedNullNode ? null : x
  }

  // 插入
  insert(key, value) {
    let y = sharedNullNode
    let x = this.root
    let z = new Node(key, value)

    while (x !== sharedNullNode) {
      y = x
      if (z.key < x.key) {
        x = x.left
      } else {
        x = x.right
      }
    }
    z.parent = y

    if (y === sharedNullNode) { // 只有一个节点的情况
      this.root = z
    } else if (z.key < y.key) {
      y.left = z
    } else {
      y.right = z
    }

    z.left = sharedNullNode
    z.right = sharedNullNode

    // 修复
    this.insertFixUp(z)
  }

  // 主要角色
  // Z 节点 一个颜色为红色的节点 初始为刚插入到新节点
  // y z 节点的叔叔节点
  // 修复过程的核心理念是让 Z 节点在整棵树中不断的上移 最坏情况就是一路上移到根节点
  insertFixUp(z) {
    while (z.parent.isRed()) { // 终止条件为没有产生双红
      // 这里注意下 z.parent.parent 必然为黑，因为我们的破坏节点为 z ，不会影响到上层的性质，简单来说就是目前的破坏只限于 z 和 z.parent 两者出现双红
      if (z.parent === z.parent.parent.left) { // 和下面的 else 互为镜像
        let y = z.parent.parent.right
        if (y.isRed()) {
          // 情况1 叔节点为红色
          // 解决方案 把叔叔节点和自己的父节点都涂黑 设置祖父节点为红色 并设置祖父为新的 z 节点
          // 这样一来就在没有破坏新的性质的情况下 让 z 节点成功上移
          z.parent.setBlack()
          y.setBlack()
          z.parent.parent.setRed()
          z = z.parent.parent
        } else if (z === z.parent.right) {
          // 情况2 叔节点为黑色 并且 z 是 其父节点的右节点
          // 解决方案 对z.parent 进行 左旋 目的是进入 case3 而且必然进入 case3
          // 由于z 和 z.parent 都为红色 所以不会造成破坏新的性质
          z = z.parent
          this.leftRotate(z)
        } else {
          // 情况3 叔节点为红色 并且 z 是 其父节点的左节点
          // 解决方案 交换 z 的父亲和祖父节点的颜色 并对 祖父进行右旋
          // 等于说是利用颜色交换消除双红 但是 z.parent.parent 左右的黑高其实被破坏了(右边的黑高因为z.parent.parent 变成红色 减少了1)
          // 所以我们利用旋转 让z.parent 接替 z.parent.parent 的位置 得以完全修复
          // 结束后由于 z.parent 必然为黑 所有循环直接结束
          z.parent.setBlack()
          z.parent.parent.setRed()
          this.rightRotate(z.parent.parent)
        }
      } else {
        let y = z.parent.parent.left
        if (y.isRed()) {
          z.parent.setBlack()
          y.setBlack()
          z.parent.parent.setRed()
          z = z.parent.parent
        } else if (z === z.parent.left) {
          z = z.parent
          this.rightRotate(z)
        } else {
          z.parent.setBlack()
          z.parent.parent.setRed()
          this.leftRotate(z.parent.parent)
        }
      }
    }

    this.root.setBlack()
  }

  remove(key) {
    // 先搜索 再删除
    const removeNode = this.search(key)
    if (removeNode) {
      console.log('new remove')
      this.delete(removeNode)
    }
  }

  // 主要角色:
  // z = 目标删除节点
  // y = 将要替换到 z 位置的节点
  // x = 将要替换到 y 位置的节点
  // originYColor = y 的原始颜色 可以判断删除结束后 是否有有可能破坏了一条或者多条红黑规则
  delete(z) {
    let y = z
    // 保存原始的 Y 颜色
    let originYColor = y.color
    let x = y
    if (z.left === sharedNullNode) { // 删除节点只有一个右节点 case1
      x = z.right
      this.transplant(z, z.right)
    } else if (z.right === sharedNullNode) { // 删除节点只有一个左节点 case 2
      x = z.left
      this.transplant(z, z.left)
    } else {  // 删除节点拥有两组节点 case 3
      y = this.minimum(z.right) // 找到能够代替 z 节点的 y 节点 也就是 z 的右子树里面最小的
      originYColor = y.color
      x = y.right
      if (y.parent === z) { // y 和 z 有直接连接 不需要处理 y 移动后的断连问题
        x.parent = y
      } else { // y 移动之后 y.parent  和 y.right 需要进行连接 所以提前进行移动
        this.transplant(y, y.right)
        y.right = z.right
        y.right.parent = y
      }

      // 把 Y 移动到原来 Z 的位置上
      this.transplant(z, y)
      y.left = z.left
      y.left.parent = y
      y.color = z.color // 这个很重要 可以维持从 z 点开始的黑高保持不变

      // case1/2 的情况下 y == z 并且 y 是红色，那么因为只有单子树 不会造成黑高变化 同时 双红肯定不会出现
      // case3 的情况下 如果 y 是红色 那么 x 必然为黑色 所以把 x 放到 y 的位置上 不会造成双红 由于 y.left 必然为 null 所有不用考虑黑高变化
      // 并且由于 y.color = z.color 所以不用担心 z 的颜色发生变化 所以也是安全的
      // 综上所述 originYColor === red 是绝对安全的
      if (originYColor === 'black') { // 可能被破坏 开始修复
        this.deleteFixUp(x)
      }
    }
  }

  // 主要角色:
  // x 目前有双重黑色的节点 如果该节点为黑色 你可以认为他自带两个黑高 如果红色 你可以认为是黑红
  // w x的兄弟节点 全部的case按照这个节点的具体情况展开
  // 修复的核心理念在于让x作为一个拥有额外一层黑色的节点，不断的让这个黑色节点向上转移，直到可以通过旋转等手段把这个额外的黑色给消化掉，同时不破坏任何性质
  deleteFixUp(x) {
    while (x !== this.root && x.isBlack()) {
      // root === x 代表多余的黑高已经放到root上 而root本身代表100个黑高也不会影响到所有根节点的黑高
      // 而红色则代表该节点可以被认为是黑红的 直接设置成黑色 就能抵消黑高的变化 并且由于这个节点是红色 x.parent 必然为黑色 也不会出现双红冲突 所以问题结束
      if (x === x.parent.left) { // 和下面的else 互为镜像
        let w = x.parent.right // x 的兄弟节点
        if (w.isRed()) {
          // 情况1 兄弟节点是红色
          // 方案 染红x.parent 并且对x.parent进行左旋 结束后 x.parent 必然为红 并且 新的w必然为黑（新的w是老w的left，而w为红）
          // 该情况可以被认为是进入case2/3/4的手段 让w的颜色转换为黑色
          w.setBlack()
          x.parent.setRed()
          this.leftRotate(x.parent)
          w = x.parent.right
        }

        // 这里可以断言 w 必然为黑色

        if (w.left.isBlack() && w.right.isBlack()) {
          // 情况2 w 是黑色的同时 左右子节点都为黑
          // 方案 把w设置为红色 然后把x.parent设置为 x 这代表着额外黑高的向上转移
          // 如果这种情况是从情况1转换来的，那么其实到这里循环就结束了，因为我们之前给x.parent设置为红色 所以下一次while不会进循环了
          w.setRed()
          x = x.parent
        } else {
          if (w.right.isBlack()) {
            // 情况3 w的右节点为黑色 左节点是红色
            // 方案 交换w.left 和 w 的颜色，w.left就变成了黑色 w变成红色 接着对w进行右旋 w.left和w交换位置 w变成w.left的右子节点
            // 这样一来 w.right自然变成了红色 就能进入case4
            w.left.setBlack()
            w.setRed()
            this.rightRotate(w)
            w = x.parent.right
          }

          // 情况4 w的右节点E为红色 左节点是黑色
          // 方案 本质上通过颜色交换和旋转 让原本的 x.parent 节点来分担 x 额外的黑高 ， w 作为新的子树根节点，w 的黑色就传递到 e 上面
          w.setColor(x.parent.color)
          x.parent.setBlack()
          w.right.setBlack()
          this.leftRotate(x.parent)
          x = this.root // 不破坏原本性质的情况下 分担了额外的黑色 所以直接结束
        }
      } else {
        let w = x.parent.left
        if (w.isRed()) {
          w.setBlack()
          x.parent.setRed()
          this.rightRotate(x.parent)
          w = x.parent.left
        }
        if (w.right.isBlack() && w.left.isBlack()) {
          w.setRed()
          x = x.parent
        } else {
          if (w.left.isBlack()) {
            w.right.setBlack()
            w.setRed()
            this.rightRotate(w)
            w = x.parent.left
          }
          w.setColor(x.parent.color)
          x.parent.setBlack()
          w.left.setBlack()
          this.rightRotate(x.parent)
          x = this.root
        }
      }
    }

    x.setBlack()
  }

  // 让 v 接替 u 的位置
  transplant(u, v) {
    if (u.parent === sharedNullNode) {
      this.root = v
    } else if (u === u.parent.left) {
      u.parent.left = v
    } else {
      u.parent.right = v
    }
    v.parent = u.parent
  }

  // 获取子树中的最小节点
  minimum(x) {
    while (x.left !== sharedNullNode) {
      x = x.left
    }
    return x
  }


  // MARK: Utils 工具库

  // 获取叔节点
  getUncleNode(node) {
    if (!node || !node.parent || !node.parent.parent) return null

    const grandfatherNode = node.parent.parent
    if (grandfatherNode.left === node.parent) {
      return node.parent.parent.right
    } else {
      return node.parent.left
    }
  }

  // 获取兄弟节点
  getBrotherNode(node) {
    if (!node || !node.parent) return null

    if (node.parent.left === node) {
      return node.right
    } else {
      return node.left
    }
  }

  // 左旋
  // 围绕X与他的右节点Y进行旋转
  // 结束时 Y 将会处于 X 的位置 并且 X 作为 Y 的左子节点
  leftRotate(x) {
    const y = x.right

    // 1. 把 y 的 左子树放到 x 的右边
    x.right = y.left
    if (y.left !== sharedNullNode) {
      y.left.parent = x
    }

    // 2. 更新 y 对 parent的引用
    y.parent = x.parent

    // 更新parent 到 Y 的引用
    if (x.parent === sharedNullNode) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }

    // 重新建立x y 之间的关系
    y.left = x
    x.parent = y
  }

  // 右旋
  // 围绕X与他的左节点Y进行旋转
  // 结束时 Y 将会处于 X 的位置 并且 X 作为 Y 的右子节点
  rightRotate(x) {
    const y = x.left

    // 1. 把 y 的 右子树放到 x 的左边
    x.left = y.right
    if (y.right !== sharedNullNode) {
      y.right.parent = x
    }

    // 2. 更新 y 对 parent的引用
    y.parent = x.parent

    // 更新parent 到 Y 的引用
    if (x.parent === sharedNullNode) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }

    // 重新建立x y 之间的关系
    y.right = x
    x.parent = y
  }

  getChildWidthMap(node, map) {
    if (!node) return 0
    if (!map[node.key]) {
      let leftWidth = 0
      let rightWidth = 0
      let base = 0
      if (!node.left && !node.right) {
        base = 60
      }
      if (node.left) {
        leftWidth = this.getChildWidthMap(node.left, map)
      }
      if (node.right) {
        rightWidth = this.getChildWidthMap(node.right, map)
      }
      const width = leftWidth + rightWidth + base
      map[node.key] = width
    }
    return map[node.key]
  }

  draw(ctx, width, height) {
    let widthMap = {}
    this.getChildWidthMap(this.root, widthMap)
    const _draw = (node, x, y, parentX, parentY) => {
      let leftWidth = 0
      if (node.left) {
        leftWidth = widthMap[node.left.key]
      }
      let rightWidth = 0
      if (node.right) {
        rightWidth = widthMap[node.right.key]
      }
      // X 偏离计算 左右子树的宽度不同 所以需要重新偏移
      if (leftWidth && rightWidth) {
        x -= (rightWidth - leftWidth) / 2
      }
      if (node.left) {
        let leftX = leftWidth / 2
        _draw(node.left, x - leftX, y + 60, x, y)
      }
      if (node.right) {
        let rightX = rightWidth / 2
        _draw(node.right, x + rightX, y + 60, x, y)
      }
      node.drawLine(ctx, x, y, parentX, parentY)
      node.draw(ctx, x, y)
    }

    _draw(this.root, width / 2, 50)
  }
}

