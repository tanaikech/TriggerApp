/**
 * GitHub  https://github.com/tanaikech/TriggerApp<br>
 * Library name
 * @type {string}
 * @const {string}
 * @readonly
 */
var appName = "TriggerApp";

/**
 * ### Description
 * Give the event object from the time-driven trigger.
 * 
 * @param {Object} object Event object from trigger.
 * @return {TriggerApp}
 */
function setEventObject(object = null) {
  this.eventObj = object || null;
  return this;
}

/**
 * ### Description
 * When this method is used, the custom current date time can be used.
 * If this is not used, the current date time is used.
 * 
 * @param {Date} dateObj Event object from trigger.
 * @return {TriggerApp}
 */
function setCustomNow(dateObj = null) {
  if (!dateObj) {
    throw new Error("Please set the date object.");
  }
  this.nowFixed = dateObj;
  this.nowTimeFixed = dateObj.getTime();
  this.now = dateObj;
  this.nowTime = dateObj.getTime();
  return this;
}

/**
 * ### Description
 * Unit is second. Default value is 60 seconds.
 * Difference of trigger time between "ownFunctionName" and "functionName". When this value is small, the trigger is reset by "ownFunctionName". By this, "functionName" is not run.
 * Please adjust this value from your script of "functionName" of your work function.
 * 
 * @param {Number} triggerOffset Trigger offset time.
 * @return {TriggerApp}
 */
function setDiffTriggerTime(diffTriggerTime = 60) {
  this.diffTriggerTime = diffTriggerTime * 1000;
  return this;
}

/**
 * ### Description
 * Unit is second. Default value is 0 s. When the date time of a new trigger is calculated,
 * if you want to give a wait time, you can set it using this method.
 * 
 * @param {Number} easeTime Number.
 * @return {TriggerApp}
 */
function setEase(easeTime = 0) {
  this.ease = easeTime * 1000;
  return this;
}

/**
 * ### Description
 * Unit is second. Default value is 0 s.
 * When the script is run, when the date time for the next trigger time is very small, you can avoid this by this method.
 * 
 * @param {Number} waitTime Wait time.
 * @return {TriggerApp}
 */
function setScriptWaitTime(waitTime = 0) {
  this.wait = waitTime * 1000;
  return this;
}

/**
 * ### Description
 * Unit is second. Default value is 0.
 * When the trigger time is just time and an error occurs, increase this value. But, the most cases will be worked with 0.
 * 
 * @param {Number} triggerOffset Trigger offset time.
 * @return {TriggerApp}
 */
function setTriggerOffsetTime(triggerOffset = 0) {
  this.triggerOffset = triggerOffset * 1000;
  return this;
}

/**
 * ### Description
 * Default value is 20. When the simulation of triggers is run, set the maximum number of results.
 * When "toDay" is not set in the inputted object, the infinite results are returned. This is used for fixing the number of results.
 * When "toDay" is set in the inputted object, all results are returned.
 * 
 * @param {Number} maximumOutput Maximum number of results for the trigger simulation.
 * @return {TriggerApp}
 */
function setMaxOutputForSimulation(maximumOutput = 20) {
  this.maximumOutput = maximumOutput;
  return this;
}

/**
 * ### Description
 * This is the main method of this library.
 * By giving the parameters, the specific functions are executed by the time-driven triggers.
 * 
 * @param {Object[]} object Array including the objects for installing the time-driven triggers.
 * @param {Callback} callback
 * @return {Object} Return value.
 */
function installTriggers(object, callback) {
  const keys = ["eventObj", "nowFixed", "nowTimeFixed", "now", "nowTime", "ease", "wait", "triggerOffset", "diffTriggerTime"];
  const values = keys.map(k => [k, this[k]]);
  const TA = new TriggerApp(values);
  const type = "installTriggers";
  return TA.installTriggers(object, callback, type);
}
/**
 * ### Description
 * Callback function from process.
 *
 * @callback Callback
 * @param {string} res Return the processes.
 */

/**
 * ### Description
 * This method installs the tasks given by data output from simulateTriggers method as the time-driven trigger.
 * 
 * @param {Object} object including the own function name and the array objects for installing the time-driven triggers.
 * @return {Object} Return value.
 */
function installTriggersByData(object) {
  const keys = ["eventObj", "nowFixed", "nowTimeFixed", "now", "nowTime", "ease", "wait", "triggerOffset", "diffTriggerTime"];
  const values = keys.map(k => [k, this[k]]);
  const TA = new TriggerApp(values);
  const type = "installTriggersByData";
  return TA.installTriggersByData(object, type);
}

/**
 * ### Description
 * This method can simulate the time-driven triggers by inputting the actual object for the setTriggers method.
 * 
 * @param {Object[]} object Array including the objects for checking the time-driven triggers.
 * @param {Callback} callback
 * @return {Object[]} Return values including the information ofthe time-driven triggers.
 */
function simulateTriggers(object, callback) {
  const keys = ["eventObj", "nowFixed", "nowTimeFixed", "now", "nowTime", "ease", "wait", "triggerOffset", "diffTriggerTime", "maximumOutput"];
  const values = keys.map(k => [k, this[k]]);
  const TA = new TriggerApp(values);
  const type = "simulateTriggers";
  return TA.simulateTriggers(object, callback, type);
}
/**
 * ### Description
 * Callback function from process.
 *
 * @callback Callback
 * @param {string} res Return the processes.
 */

/**
 * ### Description
 * Delete all project triggers of the current Google Apps Script project.
 * This method can be used independently from other methods.
 * 
 * @return {void}
 */
function deleteAllTriggers() {
  const values = ["eventObj", "nowFixed", "nowTimeFixed", "now", "nowTime", "ease", "wait", "triggerOffset", "diffTriggerTime", "maximumOutput"].map(e => [e, null]);
  return new TriggerApp(values).deleteAllTriggers_();
}

class TriggerApp {
  constructor(values) {
    const now = new Date();
    const nowTime = now.getTime();
    const nowFixed = new Date();
    const nowTimeFixed = nowFixed.getTime();
    const defaultValues = {
      now,
      nowTime,
      nowFixed,
      nowTimeFixed,
      ease: 0,
      wait: 0,
      triggerOffset: 0,
      diffTriggerTime: 60000,
      maximumOutput: 20,
    };
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      this[v[0]] = v[1] || defaultValues[v[0]];
    }

    this.timezone = Session.getScriptTimeZone();
    this.dateKeys = ["atTimes", "everyWeek", "everyMonth", "everyYear", "everyDay"];
    this.weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    this.minimumIntervalToNextTrigger = 60; // Unit is second. This value means that the minimum interval from the current trigger to the next trigger. The default is 60 seconds. In the current stage, when the minimum interval time is less than 60 seconds, the time-driven trigger cannot be installed by the function executed by the time-driven trigger. By this, I fixed the minimum interval time as 60 seconds.
  }

  // --- methods start

  installTriggers(object, callback, type) {
    const start_time = Date.now();
    const responseObj = {};
    const { triggerDateTimeObject, message } = this.getTriggerDateTimeObject_(object, callback, type);
    if (triggerDateTimeObject && !message) {
      const { obj, triggerDateTime } = triggerDateTimeObject;
      const installedTrigger1 = this.installTrigger_(obj.functionName, triggerDateTime);
      responseObj[obj.functionName] = {
        triggerDateTime,
        triggerSourceId: installedTrigger1.getTriggerSourceId(),
        uniqueId: installedTrigger1.getUniqueId(),
        scriptExecutedTime: this.now
      };
      if (obj.toDayTime > this.nowTimeFixed) {
        const triggerDateTimeWithDiff = new Date(triggerDateTime.getTime() + this.diffTriggerTime);
        const installedTrigger2 = this.installTrigger_(obj.ownFunctionName, triggerDateTimeWithDiff);
        responseObj[obj.ownFunctionName] = {
          triggerDateTime: triggerDateTimeWithDiff,
          triggerSourceId: installedTrigger2.getTriggerSourceId(),
          uniqueId: installedTrigger2.getUniqueId(),
          scriptExecutedTime: this.now
        };
      } else {
        responseObj[obj.ownFunctionName] = {
          message: `"${obj.ownFunctionName}" is not installed as the time-driven trigger. Because there is no the next trigger task.`,
          scriptExecutedTime: this.now
        };
      }
    } else {
      responseObj.done = { message: "All trigger tasks were finished." };
    }
    const end_time = Date.now();
    responseObj.processTime = (end_time - start_time) / 1000;
    return responseObj;
  }

  installTriggersByData(object, type) {
    const start_time = Date.now();
    const responseObj = {};
    const self = this;
    if (self.wait > 0) {
      Utilities.sleep(self.wait);
    }
    if (!object.hasOwnProperty("ownFunctionName") || !object.hasOwnProperty("data")) {
      throw new Error("Invalid object.");
    }
    const newAr = object.data.map(o => {
      if (!o.hasOwnProperty("triggerTime") || !o.hasOwnProperty("executeFunction")) {
        throw new Error("Invalid object.");
      }
      if (o.triggerTime && !(o.triggerTime instanceof Date)) {
        o.triggerTime = new Date(o.triggerTime);
      }
      o.triggerTime = o.triggerTime.getTime();
      return o;
    }).sort((a, b) => a.triggerTime > b.triggerTime ? 1 : -1);
    if (type == "installTriggersByData") {
      self.deleteTriggers_([object.ownFunctionName, ...(new Set(object.data.map(({ executeFunction }) => executeFunction)))]);
    }
    const nextTriggerTime = newAr.find(({ triggerTime }) => triggerTime > self.nowTime);
    if (nextTriggerTime) {
      nextTriggerTime.triggerTime = new Date(nextTriggerTime.triggerTime);
      const { triggerTime, executeFunction } = nextTriggerTime;
      const installedTrigger1 = self.installTrigger_(executeFunction, triggerTime);
      responseObj[executeFunction] = {
        triggerDateTime: triggerTime,
        triggerSourceId: installedTrigger1.getTriggerSourceId(),
        uniqueId: installedTrigger1.getUniqueId(),
        scriptExecutedTime: self.now
      };
      const n = newAr.findIndex(({ triggerTime }) => triggerTime > self.nowTime);
      if (n != newAr.length - 1) {
        const triggerDateTimeWithDiff = new Date(triggerTime.getTime() + self.diffTriggerTime);
        const installedTrigger2 = self.installTrigger_(object.ownFunctionName, triggerDateTimeWithDiff);
        responseObj[object.ownFunctionName] = {
          triggerDateTime: triggerDateTimeWithDiff,
          triggerSourceId: installedTrigger2.getTriggerSourceId(),
          uniqueId: installedTrigger2.getUniqueId(),
          scriptExecutedTime: self.now
        };
      } else {
        responseObj[executeFunction].lastTask = true;
        responseObj[executeFunction].message = "This task is the last task.";
      }
    } else {
      responseObj.done = { message: "All trigger tasks were finished." };
    }
    const end_time = Date.now();
    responseObj.processTime = (end_time - start_time) / 1000;
    return responseObj;
  }

  simulateTriggers(ar, callback, type) {
    callback("### Start trigger simulation");
    let maxOutput = -1;
    const toDayCheck = ar.some(o => !o.hasOwnProperty("toDay"));
    if (toDayCheck) {
      maxOutput = this.maximumOutput;
    }
    this.eventObj = "dummy";
    const result = [];
    let next;
    do {
      const res = this.getTriggerDateTimeObject_(ar, callback, type);
      if (res.triggerDateTimeObject && res.triggerDateTimeObject.triggerDateTime) {
        next = res.triggerDateTimeObject.triggerDateTime;
        this.setCustomNow_(next);
        const retObj = { triggerTime: next, executeFunction: res.triggerDateTimeObject.obj.functionName };
        result.push(retObj);
        callback(retObj);
      } else {
        next = null;
      }
      if (maxOutput != -1 && result.length >= maxOutput) {
        break;
      }
    } while (next);
    let msg = "### End trigger simulation";
    if (maxOutput > 0) {
      msg += "\n### Forced stopped calculation because of infinite triggers.";
    }
    callback(msg);
    return result;
  }

  // --- methods end

  setCustomNow_(now) {
    this.nowFixed = now;
    this.nowTimeFixed = this.nowFixed.getTime();
    this.now = now;
    this.nowTime = this.now.getTime();
    return this;
  }

  getTriggerDateTimeObject_(object, callback, type) {
    const self = this;
    if (self.wait > 0) {
      Utilities.sleep(self.wait);
    }
    const ar = JSON.parse(JSON.stringify(object));
    self.objectErrorCheck_(ar, type);
    const res = ar.reduce((arr, obj) => {
      if (obj.fromTime && obj.toTime && obj.interval) {
        const r = self.continuousTriggers_(obj, callback);
        if (
          (obj.toDayTime && r.getTime() > self.nowTimeFixed && r.getTime() < obj.toDayTime) ||
          (!obj.toDayTime && r.getTime() > self.nowTimeFixed)
        ) {
          arr.push({ obj, triggerDateTime: r });
        }
      } else {
        const r = self.pointTriggers_(obj, callback);
        if (
          (obj.toDayTime && r.getTime() > self.nowTimeFixed && r.getTime() < obj.toDayTime) ||
          (!obj.toDayTime && r.getTime() > self.nowTimeFixed)
        ) {
          arr.push({ obj, triggerDateTime: r });
        }
      }
      return arr;
    }, []);

    if (res.length > 0) {
      const installDateTime = res.sort((a, b) => a.triggerDateTime.getTime() > b.triggerDateTime.getTime() ? 1 : -1);
      const check = installDateTime.slice().reverse().some(({ triggerDateTime }, i, a) => {
        if (a[i + 1] && triggerDateTime.getTime() - a[i + 1].triggerDateTime.getTime() <= (self.minimumIntervalToNextTrigger * 1000)) {
          return true;
        }
        return false;
      });
      if (check) {
        throw new Error("The interval between the current trigger and the next trigger is small.");
      }
      return { triggerDateTimeObject: installDateTime[0] };
    } else {
      return { message: "There are no tasks for installing." };
    }
  }

  objectErrorCheck_(ar, type) {
    if (!ar || !Array.isArray(ar)) {
      throw new Error("Please input an array including object for using this library.");
    }
    ar.forEach(function (obj, i) {
      const {
        ownFunctionName,
        functionName,
        everyDay,
        everyWeek,
        everyMonth,
        everyYear,
        interval,
        atTimes,
        fromDay,
        toDay,
      } = obj;
      if (type == "installTriggers") {
        this.deleteTriggers_([ownFunctionName, functionName]);
      }
      if (!this.eventObj) {
        if (!atTimes && !everyDay && !everyWeek && !everyMonth && !everyYear) {
          throw new Error("Please set date time values of atTimes, everyWeek, everyMonth, everyYear.");
        }
        if (!functionName) {
          throw new Error("Please set the work function name of the function you want to execute by the time-driven trigger.");
        }
        if (!ownFunctionName) {
          throw new Error("Please set the function name of function using TriggerApp of this library.");
        }
        if (interval < this.minimumIntervalToNextTrigger) {
          throw new Error(`Your inputted interval (${interval} seconds) between the current trigger and the next trigger is smaller than ${this.minimumIntervalToNextTrigger} seconds. Please modify it.`);
        }
        if (interval <= 90) {
          // If "interval" is 90 seconds, set "diffTriggerTime" 30 seconds, because of the unstable start time for executing the function on the Google side.
          this.diffTriggerTime = 30000;
        }
      }
      if (toDay) {
        const toDayObj = new Date(toDay);
        const toDayTime = toDayObj.getTime();
        obj.toDayObj = toDayObj;
        obj.toDayTime = toDayTime;
        if (!this.eventObj && this.nowTime > toDayTime) {
          throw new Error("'toDay' is smaller than current date.");
        }
      } else {
        const toDayObj = new Date("2100-01-01T00:00:00");
        const toDayTime = toDayObj.getTime();
        obj.toDayObj = toDayObj;
        obj.toDayTime = toDayTime;
      }
      if (fromDay) {
        const fromDayObj = new Date(fromDay);
        const fromDayTime = fromDayObj.getTime();
        obj.fromDayObj = fromDayObj;
        obj.fromDayTime = fromDayTime;
      }
      const sortedObj = this.sortInputObject_(obj);
      this.dateKeys.forEach(k => {
        obj[k] = sortedObj[k];
      });
    }, this);
  }

  continuousTriggers_(obj, callback) {
    const self = this;
    const {
      everyDay,
      everyWeek,
      everyMonth,
      everyYear,
      interval,
      fromDay,
      toDay,
      fromTime,
      toTime,
      fromDayObj,
      fromDayTime,
      toDayTime,
    } = obj;
    this.now = this.nowFixed;
    this.nowTime = this.nowTimeFixed;
    if (fromDay) {
      if (this.nowTime < fromDayTime) {
        this.now = fromDayObj;
        this.nowTime = fromDayTime;
      }
    } else {
      obj.fromDay = this.now;
    }
    let [fromTimeUnix, toTimeUnix] = [fromTime, toTime].map(e => self.convTimeStrToObjWithOffset_(e).getTime());
    const dateObj = [];
    for (let t1 = fromTimeUnix; t1 <= toTimeUnix; t1 += interval * 1000) {
      dateObj.push(Utilities.formatDate(new Date(t1), self.timezone, "HH:mm"));
    }
    const nextDateTimes = this.getNextDateTime_(obj, dateObj);
    const temp1 = new Date(this.nowTime);
    temp1.setHours(...fromTime.split(":").map(f => Number(f)));
    const temp2 = new Date(this.nowTime);
    temp2.setHours(...toTime.split(":").map(f => Number(f)));
    if (temp1.getTime() > temp2.getTime()) {
      throw new Error("Value of fromTime is larger than that of toTime.");
    }
    if (everyDay && !everyWeek && !everyMonth && !everyYear) {
      callback("Detected 'everyDay' trigger.");
      return nextDateTimes.everyDay;
    } else if (!everyDay && everyWeek && !everyMonth && !everyYear) {
      callback("Detected 'everyWeek' trigger.");
      return nextDateTimes.everyWeek;
    } else if (!everyDay && !everyWeek && everyMonth && !everyYear) {
      callback("Detected 'everyMonth' trigger.");
      return nextDateTimes.everyMonth;
    } else if (!everyDay && !everyWeek && !everyMonth && everyYear) {
      callback("Detected 'everyYear' trigger.");
      if (fromDay && toDay) {
        const check = everyYear.every(e => {
          const t = new Date(e).getTime();
          return fromDayTime < t && t < toDayTime;
        });
        if (!self.eventObj && !check) {
          throw new Error("Values of 'everyYear' are out of range of 'fromDay' and 'toDay'.");
        }
      } else if (fromDay) {
        const check = everyYear.every(e => fromDayTime < new Date(e).getTime());
        if (!self.eventObj && !check) {
          throw new Error("Values of 'everyYear' are out of range of 'fromDay' and 'toDay'.");
        }
      } else if (toDay) {
        const check = everyYear.every(e => new Date(e).getTime() < toDayTime);
        if (!self.eventObj && !check) {
          throw new Error("Values of 'everyYear' are out of range of 'fromDay' and 'toDay'.");
        }
      }
      return nextDateTimes.everyYear;
    } else {
      throw new Error("The required values are not included in the inputted object.");
    }
  }

  pointTriggers_(obj, callback) {
    const { atTimes, everyDay, everyWeek, everyMonth, everyYear, fromDay, fromDayTime, fromDayObj } = obj;
    this.now = this.nowFixed;
    this.nowTime = this.nowTimeFixed;
    if (fromDay) {
      if (this.nowTime < fromDayTime) {
        this.now = fromDayObj;
        this.nowTime = fromDayTime;
      }
    } else {
      obj.fromDay = this.now;
    }
    if (atTimes) {
      const nextDateTimes = this.getNextDateTime_(obj, atTimes);
      if (atTimes && !everyDay && !everyWeek && !everyMonth && !everyYear) {
        callback("Detected 'atTimes' trigger.");
        return nextDateTimes.atTimes;
      } else if (atTimes && everyDay && !everyWeek && !everyMonth && !everyYear) {
        callback("Detected 'atTimes and everyDay' trigger.");
        return nextDateTimes.everyDay;
      } else if (atTimes && !everyDay && everyWeek && !everyMonth && !everyYear) {
        callback("Detected 'atTimes and everyWeek' trigger.");
        return nextDateTimes.everyWeek;
      } else if (atTimes && !everyDay && !everyWeek && everyMonth && !everyYear) {
        callback("Detected 'atTimes and everyMonth' trigger.");
        return nextDateTimes.everyMonth;
      } else if (atTimes && !everyDay && !everyWeek && !everyMonth && everyYear) {
        callback("Detected 'atTimes and everyYear' trigger.");
        return nextDateTimes.everyYear;
      }
    }
    throw new Error("The required values are not included in the inputted object.");
  }

  installTrigger_(functionName, dateTimeObj) {
    return ScriptApp.newTrigger(functionName).timeBased().at(dateTimeObj).create();
  }

  deleteAllTriggers_() {
    ScriptApp.getProjectTriggers().forEach(function (t) {
      ScriptApp.deleteTrigger(t);
    }, this);
    return null;
  }

  deleteTriggers_(functionList) {
    ScriptApp.getProjectTriggers().forEach(function (t) {
      if (functionList.includes(t.getHandlerFunction())) {
        ScriptApp.deleteTrigger(t);
      }
    }, this);
    return null;
  }

  convTimeStrToObjWithOffset_(s, offset = 0) {
    const temp = new Date(this.nowTime + offset);
    temp.setHours(...s.split(":").map(f => Number(f)), 0, 0);
    return temp;
  }

  sortInputObject_(obj) {
    const self = this;
    return this.dateKeys.reduce(function (o, k) {
      const v = obj[k];
      if (k in obj) {
        if (k == "atTimes") {
          o[k] = v.sort((a, b) => {
            const temp1 = new Date(self.nowTime);
            temp1.setHours(...a.split(":").map(f => Number(f)));
            const temp2 = new Date(self.nowTime);
            temp2.setHours(...b.split(":").map(f => Number(f)));
            return temp1.getTime() > temp2.getTime() ? 1 : -1;
          });
        } else if (k == "everyWeek") {
          o[k] = v.sort((a, b) => self.weekDays.indexOf(a) > self.weekDays.indexOf(b) ? 1 : -1);
        } else if (k == "everyMonth") {
          o[k] = v.sort((a, b) => a > b ? 1 : -1);
        } else if (k == "everyYear") {
          o[k] = v.map(e => new Date(e)).sort((a, b) => a.getTime() > b.getTime() ? 1 : -1);
        } else if (k == "everyDay") {
          o[k] = v;
        }
      }
      return o;
    }, {});
  }

  getNextDateTime_(obj, setTimeValues) {
    const self = this;
    if (!setTimeValues || (Array.isArray(setTimeValues) && setTimeValues.length == 0)) {
      setTimeValues = ["00:00"];
    }
    const rawValues = this.dateKeys.reduce(function (o, k) {
      const v = obj[k];
      if (v !== undefined && k in obj) {
        if (k == "atTimes") {
          const dateObj = v.map(e => {
            const temp = new Date(self.nowTime);
            temp.setHours(...e.split(":").map(f => Number(f)), 0, 0);
            return temp;
          })
          const t = dateObj.find(e => e.getTime() > (self.nowTime + self.ease));
          if (!t) {
            const t1 = new Date(self.nowTime);
            t1.setDate(t1.getDate() + 1);
            t1.setHours(dateObj[0].getHours(), dateObj[0].getMinutes(), 0, 0);
            o[k] = t1;
          } else {
            o[k] = t;
          }
        } else if (v !== undefined && k == "everyWeek") {
          const dateObj = v.flatMap(e => {
            return setTimeValues.map(tt => {
              const temp = new Date(self.nowTime);
              temp.setDate(temp.getDate() + (7 - temp.getDay() + self.weekDays.indexOf(e)) % 7);
              temp.setHours(...tt.split(":").map(f => Number(f)), 0, 0);
              if (temp.getTime() <= self.nowTime) {
                temp.setDate(temp.getDate() + 7 + (7 - temp.getDay() + self.weekDays.indexOf(e)) % 7);
                temp.setHours(...tt.split(":").map(f => Number(f)), 0, 0);
              }
              return temp;
            });
          }).sort((a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1);
          const t = dateObj.find(e => e.getTime() > (self.nowTime + self.ease));
          if (!t) {
            throw new Error("Current date time is out of range of the trigger date time.");
          } else {
            o[k] = t;
          }
        } else if (v !== undefined && k == "everyMonth") {
          const dateObj = v.flatMap(e => {
            return setTimeValues.map(tt => {
              const temp = new Date(self.nowTime);
              const td = temp.getDate();
              if (td > e) {
                temp.setMonth(temp.getMonth() + 1);
              }
              temp.setDate(e);
              temp.setHours(...tt.split(":").map(f => Number(f)), 0, 0);
              if (temp.getTime() <= self.nowTime) {
                temp.setMonth(temp.getMonth() + 1);
              }
              return temp;
            });
          }).sort((a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1);
          const t = dateObj.find(e => e.getTime() > (self.nowTime + self.ease));
          if (!t) {
            throw new Error("Current date time is out of range of the trigger date time.");
          } else {
            o[k] = t;
          }
        } else if (v !== undefined && k == "everyYear") {
          const dateObj = v.flatMap(e => {
            const ee = new Date(e);
            let t1y = ee.getFullYear();
            const t1m = ee.getMonth();
            const t1d = ee.getDate();
            const nowYear = self.now.getFullYear()
            if (t1y < nowYear) {
              t1y = nowYear;
            }
            return setTimeValues.map(tt => {
              const temp = new Date(self.nowTime);
              const t2y = temp.getFullYear();
              const t2m = temp.getMonth();
              const t2d = temp.getDate();
              if (t2y > t1y) {
                temp.setFullYear(temp.getFullYear() + 1);
              } else {
                temp.setFullYear(t1y);
              }
              if (t2m > t1m) {
                temp.setMonth(temp.getMonth() + 1);
              } else {
                temp.setMonth(t1m);
              }
              if (t2d > t1d) {
                temp.setDate(temp.getDate() + 1);
              } else {
                temp.setDate(t1d);
              }
              temp.setHours(...tt.split(":").map(f => Number(f)), 0, 0);
              if (temp.getTime() <= self.nowTime) {
                temp.setFullYear(temp.getFullYear() + 1);
              }
              return temp;
            });
          }).sort((a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1);
          const t = dateObj.find(e => e.getTime() > (self.nowTime + self.ease));
          if (!t) {
            throw new Error("Current date time is out of range of the trigger date time.");
          } else {
            o[k] = t;
          }
        } else if (v !== undefined && k == "everyDay") {
          if (v === true) {
            const dateObj = setTimeValues.map(tt => {
              const temp = new Date(self.nowTime);
              temp.setHours(...tt.split(":").map(f => Number(f)), 0, 0);
              return temp;
            }).sort((a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1);
            const t = dateObj.find(e => e.getTime() > (self.nowTime + self.ease));
            if (!t) {
              const dateObj = setTimeValues.map(tt => {
                const temp = new Date(self.nowTime);
                temp.setDate(temp.getDate() + 1);
                temp.setHours(...tt.split(":").map(f => Number(f)), 0, 0);
                return temp;
              }).sort((a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1);
              const t = dateObj.find(e => e.getTime() > (self.nowTime + self.ease));
              o[k] = t;
            } else {
              o[k] = t;
            }
          }
        }
      }
      return o;
    }, {});
    if (self.triggerOffset > 0) {
      this.dateKeys.forEach(key => {
        if (rawValues[key]) {
          rawValues[key].setSeconds(self.triggerOffset);
        }
      });
    }
    return rawValues;
  }
}
