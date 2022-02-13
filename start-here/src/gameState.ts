import { modFox, modScene, showPoopBag, writeModal } from "./ui";
import * as constants from "./constants";

const gameState = {
  current: "INIT",
  clock: 1,
  waitTime: -1,
  sleepTime: -1,
  hungryTime: -1,
  dieTime: -1,
  poopTime: -1,
  timeToStartCelebrating: -1,
  timetoEndCelebrating: -1,
  tick() {
    this.clock++;
    console.log("clock", this.clock);

    if (this.clock === this.wakeTime) {
      this.wake();
    } else if (this.clock === this.sleepTime) {
      this.sleep();
    } else if (this.clock === this.hungryTime) {
      this.getHungry();
    } else if (this.clock === this.dieTime) {
      this.die();
    } else if (this.clock === this.timeToStartCelebrating) {
      this.startCelebrating();
    } else if (this.clock === this.timetoEndCelebrating) {
      this.endCelebrating();
    } else if (this.clock === this.poopTime) {
      this.poop();
    }

    return this.clock;
  },
  startGame() {
    this.current = "HATCHING";
    this.wakeTime = this.clock + 3;
    modFox("egg");
    modScene("day");
    writeModal();
  },
  wake() {
    this.current = "IDLING";
    this.waitTime = -1;
    this.scene = Math.random() > constants.RAIN_CHANCE ? 0 : 1;
    modScene(constants.SCENES[this.scene]);
    this.determineFoxState();
    this.sleepTime = this.clock + constants.DAY_LENGTH;
    this.hungryTime = constants.getNextHungerTime(this.clock);
  },
  sleep() {
    this.state = "SLEEP";
    modFox("sleep");
    modScene("night");
    this.clearTimes();
    this.wakeTime = this.clock + constants.NIGHT_LENGTH;
  },
  clearTimes() {
    this.wakeTime = -1;
    this.sleepTime = -1;
    this.hungryTime = -1;
    this.dieTime = -1;
    this.poopTime = -1;
    this.timeToStartCelebrating = -1;
    this.timetoEndCelebrating = -1;
  },
  getHungry() {
    this.current = "HUNGRY";
    this.dieTime = constants.getNextDieTime(this.clock);
    this.hungryTime = -1;
    modFox("hungry");
  },
  poop() {
    this.current = "POOPING";
    this.poopTime = -1;
    this.dieTime = constants.getNextDieTime(this.clock);
    modFox("pooping");
  },
  die() {
    this.current = "DEAD";
    modScene("dead");
    modFox("dead");
    this.clearTimes();
    writeModal("The Fox died :( </br> Press the middle button to start");
  },
  startCelebrating() {
    this.current = "CELEBRATING";
    modFox("celebrate");
    this.timeToStartCelebrating = -1;
    this.timetoEndCelebrating = this.clock + 2;
  },
  endCelebrating() {
    this.timetoEndCelebrating = -1;
    this.current = "IDLING";
    this.determineFoxState();
    showPoopBag(false);
  },
  determineFoxState() {
    if (this.current === "IDLING") {
      if (constants.SCENES[this.scene] === "rain") {
        modFox("rain");
      } else {
        modFox("idling");
      }
    }
  },
  handleUserAction(icon) {
    if (
      ["SLEEP", "FEEDING", "CELEBRATING", "HATCHING"].includes(this.current)
    ) {
      // do nothing
      return;
    }

    if (this.current === "INIT" || this.current === "DEAD") {
      this.startGame();
      return;
    }

    switch (icon) {
      case "weather":
        this.changeWeather();
        break;
      case "poop":
        this.cleanupPoop();
        break;
      case "fish":
        this.feed();
        break;
    }
  },
  changeWeather() {
    this.scene = (this.scene + 1) % constants.SCENES.length;
    modScene(constants.SCENES[this.scene]);
    this.determineFoxState();
  },
  cleanupPoop() {
    if (this.current !== "POOPING") {
      return;
    }

    this.dieTime = -1;
    showPoopBag(true);
    this.startCelebrating();
    this.hungryTime = constants.getNextHungerTime(this.clock);
  },
  feed() {
    if (this.current !== "HUNGRY") {
      return;
    }

    this.current = "FEEDING";
    this.dieTime = -1;
    this.poopTime = constants.getNextPoopTime(this.clock);
    modFox("eating");
    this.timeToStartCelebrating = this.clock + 2;
  },
};

export default gameState;
