class Cat {
  constructor(crEl, ctEl) {
    this.isWorking = false
    this.countup = 0
    this.credits = Number(window.localStorage.getItem('credits')) || 0

    this.creditsEl = crEl
    this.countEl = ctEl

    this.availables = []
    this.owned = JSON.parse(window.localStorage.getItem('owned')) || [
      { name: "Basic", img: "working.gif", price: 0 }
    ]

    this.selectionned = window.localStorage.getItem('selectionned') || 'working.gif'

    this.rewardInterval = () => {}
    this.countInterval = () => {}

    this.creditsEl.innerHTML = `Crédits: ${this.credits}`
  }

  getDefault() {
    return 'img/hi.gif'
  }

  onclick(el) {
    if (this.isWorking) {
      this.clearRewardCycle()
      this.clearCountCycle(this.countEl)
      el.target.setAttribute('src', this.getDefault())
      window.localStorage.setItem('credits', this.credits)
      this.countup = 0
    } else {
      el.target.setAttribute('src', `img/availables/${this.selectionned}`)
      this.setCountCycle(this.countEl)
      this.setRewardCycle(this.creditsEl)
    }
    this.isWorking = !this.isWorking
  }

  
  incrementCount() {
    if (this.isWorking) {
      const hours = Math.floor(this.countup / 60 / 60);
      const minutes = Math.floor(this.countup / 60) - (hours * 60);
      const seconds = this.countup % 60;
      const result = hours + ':' + minutes + ':' + seconds;
      this.countup += 1
      return result
    }
  }

  getReward() {
    if (this.isWorking) {
      this.credits += 1
    }
    return this.credits
  }

  setCountCycle(countEl) {
    this.countInterval = setInterval(() => {
      const text = this.incrementCount()
      countEl.innerHTML = text
    }, 1000)
  }

  setRewardCycle(creditsEl) {
    this.rewardInterval = setInterval(() => {
      if (this.isWorking) {
        const credits = this.getReward()
        creditsEl.innerHTML = `Crédits : ${credits}`
      }
    }, 10000)
  }

  clearRewardCycle() {
    clearInterval(this.rewardInterval)
  }

  clearCountCycle(countEl) {
    countEl.innerHTML = 'Démarrez une session de travail en caressant le chat'
    clearInterval(this.countInterval)
  }

  async fetchAvailable(link) {
    const resource = await fetch(link)
    const json = await resource.json()
    this.availables = json
  }

  getAvailables() {
    let html = ''
    this.availables.forEach(available => html += `
    <div>
      <img src="img/availables/${available.img}" alt="${available.name}"/>
      <p>${available.name}</p>
      <p style="color: green">${available.price} Crédits</p>
      ${this.owned.find(cat => cat.name === available.name) ? `<button onclick="select('${available.name}')">Sélectionn${this.selectionned === available.img ? 'é' : 'er'}</button>` : `<button onclick="buy('${available.name}')">Acheter</button>`}
    </div>
    </br>
    `)

    return html
  }
  
  selectCat(catName) {
    this.selectionned = this.owned.find(cat => cat.name === catName).img
    window.localStorage.setItem('selectionned', this.selectionned)
  }
}

const catEl = document.getElementById('cat')
const countEl = document.getElementById('countup')
const creditsEl = document.getElementById('credits')

const cat = new Cat(creditsEl, countEl)


function buy(catName) {
  const newCat = cat.availables.find(available => available.name == catName)
  cat.owned.push(newCat)
  cat.credits -= newCat.price
  window.localStorage.setItem('credits', cat.credits)
  window.localStorage.setItem('owned', JSON.stringify(cat.owned))
  const availablesSection = document.getElementById('availables')
  availablesSection.innerHTML = cat.getAvailables()

  creditsEl.innerHTML = `Crédits ${cat.credits}`
}

function select(catName) {
  cat.selectCat(catName)
  const availablesSection = document.getElementById('availables')
  availablesSection.innerHTML = cat.getAvailables()
  if (cat.isWorking) {
    catEl.setAttribute('src', `img/availables/${cat.selectionned}`)
  }
}

function reinit() {
  window.localStorage.removeItem('credits')
  window.localStorage.removeItem('owned')
  window.localStorage.removeItem('selectionned')
  window.location = '/'
}

document.body.onload = async () => {
  const noSleep = new NoSleep()
  document.addEventListener('click', function enableNoSleep() {
    document.removeEventListener('click', enableNoSleep, false);
    noSleep.enable();
  }, false);

  catEl.onclick = (el) => {
    cat.onclick(el, creditsEl, countEl)
  }

  let isDisplayed = 'main'

  const main = document.getElementById('main')
  const shop = document.getElementById('shop')

  const shopTrigger = document.getElementById('shop-trigger')
  const shopSpan = document.getElementById('shop-span')
  const settingsTrigger = document.getElementById('settings-trigger')
  const settingsSpan = document.getElementById('settings-span')

  await cat.fetchAvailable('availables.json')

  const availablesSection = document.getElementById('availables')
  console.log(cat.owned)
  availablesSection.innerHTML = cat.getAvailables()

  shopTrigger.onclick = shopSpan.onclick = () => {
    if (isDisplayed === 'main') {
      main.style.display = 'none'
      shop.style.display = 'block'
      isDisplayed = 'shop'
    } else if (isDisplayed === 'shop') {
      main.style.display = 'block'
      shop.style.display = 'none'
      isDisplayed = 'main'
    } else if (isDisplayed === 'settings') {
      settings.style.display = 'none'
      shop.style.display = 'block'
      isDisplayed = 'shop'
    }
  }

  settingsTrigger.onclick = settingsSpan.onclick = () => {
    if (isDisplayed === 'main') {
      main.style.display = 'none'
      settings.style.display = 'block'
      isDisplayed = 'settings'
    } else if (isDisplayed === 'settings') {
      main.style.display = 'block'
      settings.style.display = 'none'
      isDisplayed = 'main'
    } else if (isDisplayed === 'shop') {
      shop.style.display = 'none'
      settings.style.display = 'block'
      isDisplayed = 'settings'
    }
  }
}
