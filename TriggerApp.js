/**
 * GitHub  https://github.com/tanaikech/TriggerApp<br>
 * Library name
 * @type {string}
 * @const {string}
 * @readonly
 */
const appName = "TriggerApp";

/**
 * ### Description
 * Give the event object from the time-driven trigger.
 *
 * @param {Object} object Event object from trigger.
 * @return {this}
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
 * @return {this}
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
 * @param {Number} diffTriggerTime Trigger offset time.
 * @return {this}
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
 * @return {this}
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
 * @return {this}
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
 * @return {this}
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
 * @return {this}
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
 * @param {Function} callback Callback function from process.
 * @return {Object} Return value.
 */
function installTriggers(object, callback) {
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
  ];
  const values = keys.map((k) => [k, this[k]]);
  const TA = new TriggerApp(values);
  return TA.installTriggers(object, callback, "installTriggers");
}

/**
 * ### Description
 * This method installs the tasks given by data output from simulateTriggers method as the time-driven trigger.
 *
 * @param {Object} object including the own function name and the array objects for installing the time-driven triggers.
 * @return {Object} Return value.
 */
function installTriggersByData(object) {
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
  ];
  const values = keys.map((k) => [k, this[k]]);
  const TA = new TriggerApp(values);
  return TA.installTriggersByData(object, "installTriggersByData");
}

/**
 * ### Description
 * This method can simulate the time-driven triggers by inputting the actual object for the setTriggers method.
 *
 * @param {Object[]} object Array including the objects for checking the time-driven triggers.
 * @param {Function} callback Callback function from process.
 * @return {Object[]} Return values including the information of the time-driven triggers.
 */
function simulateTriggers(object, callback) {
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
    "maximumOutput",
  ];
  const values = keys.map((k) => [k, this[k]]);
  const TA = new TriggerApp(values);
  return TA.simulateTriggers(object, callback, "simulateTriggers");
}

/**
 * ### Description
 * Delete all project triggers of the current Google Apps Script project.
 * This method can be used independently from other methods.
 *
 * @return {null}
 */
function deleteAllTriggers() {
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
    "maximumOutput",
  ];
  const values = keys.map((k) => [k, null]);
  return new TriggerApp(values).deleteAllTriggers_();
}

class TriggerApp {
  constructor(values) {
    const now = new Date();
    const nowTime = now.getTime();
    const nowFixed = new Date();
    const nowTimeFixed = nowFixed.getTime();

    this.infiniteDateObj = new Date();
    this.infiniteDateObj.setFullYear(this.infiniteDateObj.getFullYear() + 100);
    this.infiniteDateTime = this.infiniteDateObj.getTime();

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

    values.forEach(([key, val]) => {
      this[key] = val ?? defaultValues[key];
    });

    this.timezone = Session.getScriptTimeZone();
    this.dateKeys = [
      "atTimes",
      "everyWeek",
      "everyMonth",
      "everyYear",
      "everyDay",
    ];
    this.weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    this.minimumIntervalToNextTrigger = 60; // Unit is second.
  }

  // --- methods start

  installTriggers(object, callback, type) {
    const startTime = Date.now();
    const responseObj = {};
    const { triggerDateTimeObject, message } = this.getTriggerDateTimeObject_(
      object,
      callback,
      type,
    );

    if (triggerDateTimeObject && !message) {
      const { obj, triggerDateTime } = triggerDateTimeObject;
      const installedTrigger1 = this.installTrigger_(
        obj.functionName,
        triggerDateTime,
      );

      responseObj[obj.functionName] = {
        triggerDateTime,
        triggerSourceId: installedTrigger1.getTriggerSourceId(),
        uniqueId: installedTrigger1.getUniqueId(),
        scriptExecutedTime: this.now,
      };

      if (obj.toDayTime > this.nowTimeFixed) {
        const triggerDateTimeWithDiff = new Date(
          triggerDateTime.getTime() + this.diffTriggerTime,
        );
        const installedTrigger2 = this.installTrigger_(
          obj.ownFunctionName,
          triggerDateTimeWithDiff,
        );

        responseObj[obj.ownFunctionName] = {
          triggerDateTime: triggerDateTimeWithDiff,
          triggerSourceId: installedTrigger2.getTriggerSourceId(),
          uniqueId: installedTrigger2.getUniqueId(),
          scriptExecutedTime: this.now,
        };
      } else {
        responseObj[obj.ownFunctionName] = {
          message: `"${obj.ownFunctionName}" is not installed as the time-driven trigger. Because there is no the next trigger task.`,
          scriptExecutedTime: this.now,
        };
      }
    } else {
      responseObj.done = { message: "All trigger tasks were finished." };
    }

    responseObj.processTime = (Date.now() - startTime) / 1000;
    return responseObj;
  }

  installTriggersByData(object, type) {
    const startTime = Date.now();
    const responseObj = {};
    this.sleepIfRequired_();

    if (!object?.ownFunctionName || !object?.data) {
      throw new Error("Invalid object.");
    }

    const tasks = object.data
      .map((o) => {
        if (!o.triggerTime || !o.executeFunction) {
          throw new Error("Invalid object.");
        }
        const triggerTimeMs =
          o.triggerTime instanceof Date
            ? o.triggerTime.getTime()
            : new Date(o.triggerTime).getTime();
        return { ...o, triggerTime: triggerTimeMs };
      })
      .sort((a, b) => a.triggerTime - b.triggerTime);

    if (type === "installTriggersByData") {
      const functionList = [
        object.ownFunctionName,
        ...new Set(tasks.map((t) => t.executeFunction)),
      ];
      this.deleteTriggers_(functionList);
    }

    const nextTask = tasks.find((t) => t.triggerTime > this.nowTime);

    if (nextTask) {
      const triggerDateTime = new Date(nextTask.triggerTime);
      const { executeFunction } = nextTask;
      const installedTrigger1 = this.installTrigger_(
        executeFunction,
        triggerDateTime,
      );

      responseObj[executeFunction] = {
        triggerDateTime,
        triggerSourceId: installedTrigger1.getTriggerSourceId(),
        uniqueId: installedTrigger1.getUniqueId(),
        scriptExecutedTime: this.now,
      };

      const taskIndex = tasks.findIndex((t) => t === nextTask);
      const isNotLast = taskIndex !== tasks.length - 1;

      if (isNotLast) {
        const triggerDateTimeWithDiff = new Date(
          triggerDateTime.getTime() + this.diffTriggerTime,
        );
        const installedTrigger2 = this.installTrigger_(
          object.ownFunctionName,
          triggerDateTimeWithDiff,
        );
        responseObj[object.ownFunctionName] = {
          triggerDateTime: triggerDateTimeWithDiff,
          triggerSourceId: installedTrigger2.getTriggerSourceId(),
          uniqueId: installedTrigger2.getUniqueId(),
          scriptExecutedTime: this.now,
        };
      } else {
        responseObj[executeFunction].lastTask = true;
        responseObj[executeFunction].message = "This task is the last task.";
      }
    } else {
      responseObj.done = { message: "All trigger tasks were finished." };
    }

    responseObj.processTime = (Date.now() - startTime) / 1000;
    return responseObj;
  }

  simulateTriggers(ar, callback, type) {
    if (callback) callback("### Start trigger simulation");
    const hasInfinite = ar.some((o) => !o.hasOwnProperty("toDay"));
    const maxOutput = hasInfinite ? this.maximumOutput : -1;

    this.eventObj = "dummy";
    const result = [];
    let nextDate;

    do {
      const res = this.getTriggerDateTimeObject_(ar, callback, type);
      nextDate = res.triggerDateTimeObject?.triggerDateTime || null;

      if (nextDate) {
        this.setCustomNow_(nextDate);
        const retObj = {
          triggerTime: nextDate,
          executeFunction: res.triggerDateTimeObject.obj.functionName,
        };
        result.push(retObj);
        if (callback) callback(retObj);
      }

      if (maxOutput !== -1 && result.length >= maxOutput) break;
    } while (nextDate);

    let msg = "### End trigger simulation";
    if (maxOutput > 0)
      msg += "\n### Forced stopped calculation because of infinite triggers.";
    if (callback) callback(msg);

    return result;
  }

  // --- methods end

  sleepIfRequired_() {
    if (this.wait > 0) Utilities.sleep(this.wait);
  }

  setCustomNow_(now) {
    this.nowFixed = now;
    this.nowTimeFixed = now.getTime();
    this.now = now;
    this.nowTime = now.getTime();
    return this;
  }

  getTriggerDateTimeObject_(object, callback, type) {
    this.sleepIfRequired_();

    const ar = JSON.parse(JSON.stringify(object));
    this.objectErrorCheck_(ar, type);

    const candidates = ar.reduce((arr, obj) => {
      const isContinuous = obj.fromTime && obj.toTime && obj.interval;
      const triggerTime = isContinuous
        ? this.continuousTriggers_(obj, callback)
        : this.pointTriggers_(obj, callback);

      if (!triggerTime) return arr;

      const isAfterNow = triggerTime.getTime() > this.nowTimeFixed;
      const isBeforeToDay =
        !obj.toDayTime || triggerTime.getTime() < obj.toDayTime;

      if (isAfterNow && isBeforeToDay) {
        arr.push({ obj, triggerDateTime: triggerTime });
      }
      return arr;
    }, []);

    if (candidates.length > 0) {
      candidates.sort(
        (a, b) => a.triggerDateTime.getTime() - b.triggerDateTime.getTime(),
      );

      const checkInterval = candidates.some((cand, i, arr) => {
        if (i < arr.length - 1) {
          const diff =
            arr[i + 1].triggerDateTime.getTime() -
            cand.triggerDateTime.getTime();
          return diff <= this.minimumIntervalToNextTrigger * 1000;
        }
        return false;
      });

      if (checkInterval) {
        throw new Error(
          "The interval between the current trigger and the next trigger is small.",
        );
      }

      return { triggerDateTimeObject: candidates[0] };
    }

    return { message: "There are no tasks for installing." };
  }

  objectErrorCheck_(ar, type) {
    if (!ar || !Array.isArray(ar)) {
      throw new Error(
        "Please input an array including object for using this library.",
      );
    }

    if (type === "installTriggers") {
      const functionsToDelete = ar
        .flatMap((obj) => [obj.ownFunctionName, obj.functionName])
        .filter(Boolean);
      if (functionsToDelete.length > 0) {
        this.deleteTriggers_([...new Set(functionsToDelete)]);
      }
    }

    ar.forEach((obj) => {
      if (!this.eventObj) {
        if (
          !obj.atTimes &&
          !obj.everyDay &&
          !obj.everyWeek &&
          !obj.everyMonth &&
          !obj.everyYear
        ) {
          throw new Error(
            "Please set date time values of atTimes, everyWeek, everyMonth, everyYear.",
          );
        }
        if (!obj.functionName) {
          throw new Error(
            "Please set the work function name of the function you want to execute by the time-driven trigger.",
          );
        }
        if (!obj.ownFunctionName) {
          throw new Error(
            "Please set the function name of function using TriggerApp of this library.",
          );
        }
        if (obj.interval < this.minimumIntervalToNextTrigger) {
          throw new Error(
            `Your inputted interval (${obj.interval} seconds) between the current trigger and the next trigger is smaller than ${this.minimumIntervalToNextTrigger} seconds. Please modify it.`,
          );
        }
        if (obj.interval <= 90) {
          this.diffTriggerTime = 30000;
        }
      }

      if (obj.toDay) {
        const toDayObj = new Date(obj.toDay);
        obj.toDayTime = toDayObj.getTime();
        obj.toDayObj = toDayObj;
        if (!this.eventObj && this.nowTime > obj.toDayTime) {
          throw new Error("'toDay' is smaller than current date.");
        }
      } else {
        obj.toDayObj = this.infiniteDateObj;
        obj.toDayTime = this.infiniteDateTime;
      }

      if (obj.fromDay) {
        const fromDayObj = new Date(obj.fromDay);
        obj.fromDayTime = fromDayObj.getTime();
        obj.fromDayObj = fromDayObj;
      }

      const sortedObj = this.sortInputObject_(obj);
      this.dateKeys.forEach((k) => {
        if (sortedObj[k] !== undefined) obj[k] = sortedObj[k];
      });
    });
  }

  continuousTriggers_(obj, callback) {
    const {
      everyDay,
      everyWeek,
      everyMonth,
      everyYear,
      interval,
      fromDay,
      fromTime,
      toTime,
      fromDayObj,
      fromDayTime,
      toDay,
      toDayTime,
    } = obj;

    this.now = new Date(this.nowFixed.getTime());
    this.nowTime = this.nowTimeFixed;

    if (fromDay && this.nowTime < fromDayTime) {
      this.now = new Date(fromDayObj.getTime());
      this.nowTime = fromDayTime;
    } else {
      obj.fromDay = this.now;
    }

    const fromTimeUnix = this.convTimeStrToObjWithOffset_(fromTime).getTime();
    const toTimeUnix = this.convTimeStrToObjWithOffset_(toTime).getTime();

    const dateObj = [];
    for (let t1 = fromTimeUnix; t1 <= toTimeUnix; t1 += interval * 1000) {
      dateObj.push(Utilities.formatDate(new Date(t1), this.timezone, "HH:mm"));
    }

    const nextDateTimes = this.getNextDateTime_(obj, dateObj);

    const temp1 = this.convTimeStrToObjWithOffset_(fromTime);
    const temp2 = this.convTimeStrToObjWithOffset_(toTime);
    if (temp1.getTime() > temp2.getTime()) {
      throw new Error("Value of fromTime is larger than that of toTime.");
    }

    if (everyDay && !everyWeek && !everyMonth && !everyYear) {
      if (callback) callback("Detected 'everyDay' trigger.");
      return nextDateTimes.everyDay;
    } else if (!everyDay && everyWeek && !everyMonth && !everyYear) {
      if (callback) callback("Detected 'everyWeek' trigger.");
      return nextDateTimes.everyWeek;
    } else if (!everyDay && !everyWeek && everyMonth && !everyYear) {
      if (callback) callback("Detected 'everyMonth' trigger.");
      return nextDateTimes.everyMonth;
    } else if (!everyDay && !everyWeek && !everyMonth && everyYear) {
      if (callback) callback("Detected 'everyYear' trigger.");

      const isYearValid = everyYear.every((e) => {
        const t = new Date(e).getTime();
        const afterFrom = fromDay ? fromDayTime < t : true;
        const beforeTo = toDay ? t < toDayTime : true;
        return afterFrom && beforeTo;
      });

      if (!this.eventObj && !isYearValid) {
        throw new Error(
          "Values of 'everyYear' are out of range of 'fromDay' and 'toDay'.",
        );
      }
      return nextDateTimes.everyYear;
    }
    throw new Error(
      "The required values are not included in the inputted object.",
    );
  }

  pointTriggers_(obj, callback) {
    const {
      atTimes,
      everyDay,
      everyWeek,
      everyMonth,
      everyYear,
      fromDay,
      fromDayTime,
      fromDayObj,
    } = obj;

    this.now = new Date(this.nowFixed.getTime());
    this.nowTime = this.nowTimeFixed;

    if (fromDay && this.nowTime < fromDayTime) {
      this.now = new Date(fromDayObj.getTime());
      this.nowTime = fromDayTime;
    } else {
      obj.fromDay = this.now;
    }

    if (atTimes) {
      const nextDateTimes = this.getNextDateTime_(obj, atTimes);
      if (!everyDay && !everyWeek && !everyMonth && !everyYear) {
        if (callback) callback("Detected 'atTimes' trigger.");
        return nextDateTimes.atTimes;
      } else if (everyDay && !everyWeek && !everyMonth && !everyYear) {
        if (callback) callback("Detected 'atTimes and everyDay' trigger.");
        return nextDateTimes.everyDay;
      } else if (!everyDay && everyWeek && !everyMonth && !everyYear) {
        if (callback) callback("Detected 'atTimes and everyWeek' trigger.");
        return nextDateTimes.everyWeek;
      } else if (!everyDay && !everyWeek && everyMonth && !everyYear) {
        if (callback) callback("Detected 'atTimes and everyMonth' trigger.");
        return nextDateTimes.everyMonth;
      } else if (!everyDay && !everyWeek && !everyMonth && everyYear) {
        if (callback) callback("Detected 'atTimes and everyYear' trigger.");
        return nextDateTimes.everyYear;
      }
    }
    throw new Error(
      "The required values are not included in the inputted object.",
    );
  }

  installTrigger_(functionName, dateTimeObj) {
    return ScriptApp.newTrigger(functionName)
      .timeBased()
      .at(dateTimeObj)
      .create();
  }

  deleteAllTriggers_() {
    ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
    return null;
  }

  deleteTriggers_(functionList) {
    if (!functionList || functionList.length === 0) return null;
    const funcs = new Set(functionList);
    ScriptApp.getProjectTriggers().forEach((t) => {
      if (funcs.has(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
    });
    return null;
  }

  convTimeStrToObjWithOffset_(s, offset = 0) {
    const temp = new Date(this.nowTime + offset);
    const [hours, mins, secs = 0] = s.split(":").map(Number);
    temp.setHours(hours, mins, secs, 0);
    return temp;
  }

  sortInputObject_(obj) {
    return this.dateKeys.reduce((o, k) => {
      if (k in obj && obj[k] !== undefined) {
        const v = obj[k];
        if (k === "atTimes") {
          o[k] = [...v].sort((a, b) => {
            const t1 = this.convTimeStrToObjWithOffset_(a).getTime();
            const t2 = this.convTimeStrToObjWithOffset_(b).getTime();
            return t1 - t2;
          });
        } else if (k === "everyWeek") {
          o[k] = [...v].sort(
            (a, b) => this.weekDays.indexOf(a) - this.weekDays.indexOf(b),
          );
        } else if (k === "everyMonth") {
          o[k] = [...v].sort((a, b) => a - b);
        } else if (k === "everyYear") {
          o[k] = [...v]
            .map((e) => new Date(e))
            .sort((a, b) => a.getTime() - b.getTime());
        } else if (k === "everyDay") {
          o[k] = v;
        }
      }
      return o;
    }, {});
  }

  static addMonths_(date) {
    const d = date.getDate();
    date.setMonth(date.getMonth() + 1);
    if (date.getDate() !== d) {
      date.setDate(0);
    }
  }

  getNextDateTime_(obj, setTimeValues = ["00:00"]) {
    if (!Array.isArray(setTimeValues) || setTimeValues.length === 0) {
      setTimeValues = ["00:00"];
    }

    const rawValues = this.dateKeys.reduce((o, k) => {
      const v = obj[k];
      if (v === undefined || !(k in obj)) return o;

      const thresholdTime = this.nowTime + this.ease;

      if (k === "atTimes") {
        const dates = v.map((e) => this.convTimeStrToObjWithOffset_(e));
        const nextTime = dates.find((e) => e.getTime() > thresholdTime);

        if (!nextTime) {
          const t1 = new Date(this.nowTime);
          t1.setDate(t1.getDate() + 1);
          t1.setHours(dates[0].getHours(), dates[0].getMinutes(), 0, 0);
          o[k] = t1;
        } else {
          o[k] = nextTime;
        }
      } else if (k === "everyWeek") {
        const dates = v
          .flatMap((dayStr) => {
            return setTimeValues.map((tt) => {
              const temp = new Date(this.nowTime);
              const targetDay = this.weekDays.indexOf(dayStr);
              let daysToAdd = (7 - temp.getDay() + targetDay) % 7;
              temp.setDate(temp.getDate() + daysToAdd);
              const [hours, mins, secs = 0] = tt.split(":").map(Number);
              temp.setHours(hours, mins, secs, 0);

              if (temp.getTime() <= this.nowTime) {
                temp.setDate(temp.getDate() + 7);
              }
              return temp;
            });
          })
          .sort((a, b) => a.getTime() - b.getTime());

        const nextTime = dates.find((e) => e.getTime() > thresholdTime);
        if (!nextTime)
          throw new Error(
            "Current date time is out of range of the trigger date time.",
          );
        o[k] = nextTime;
      } else if (k === "everyMonth") {
        const dates = v
          .flatMap((dayNum) => {
            return setTimeValues.map((tt) => {
              const temp = new Date(this.nowTime);
              const td = temp.getDate();
              if (td > dayNum) TriggerApp.addMonths_(temp);
              temp.setDate(dayNum);
              const [hours, mins, secs = 0] = tt.split(":").map(Number);
              temp.setHours(hours, mins, secs, 0);

              if (temp.getTime() <= this.nowTime) {
                TriggerApp.addMonths_(temp);
                temp.setDate(dayNum);
              }
              return temp;
            });
          })
          .sort((a, b) => a.getTime() - b.getTime());

        const nextTime = dates.find((e) => e.getTime() > thresholdTime);
        if (!nextTime)
          throw new Error(
            "Current date time is out of range of the trigger date time.",
          );
        o[k] = nextTime;
      } else if (k === "everyYear") {
        const dates = v
          .flatMap((dateStr) => {
            const ee = new Date(dateStr);
            let t1y = ee.getFullYear();
            const t1m = ee.getMonth();
            const t1d = ee.getDate();
            const nowYear = this.now.getFullYear();

            if (t1y < nowYear) t1y = nowYear;

            return setTimeValues.map((tt) => {
              const temp = new Date(this.nowTime);
              const t2y = temp.getFullYear();
              const t2m = temp.getMonth();
              const t2d = temp.getDate();

              if (t2y > t1y) temp.setFullYear(temp.getFullYear() + 1);
              else temp.setFullYear(t1y);

              if (t2m > t1m) TriggerApp.addMonths_(temp);
              else temp.setMonth(t1m);

              if (t2d > t1d) temp.setDate(temp.getDate() + 1);
              else temp.setDate(t1d);

              const [hours, mins, secs = 0] = tt.split(":").map(Number);
              temp.setHours(hours, mins, secs, 0);

              if (temp.getTime() <= this.nowTime) {
                temp.setFullYear(temp.getFullYear() + 1);
              }
              return temp;
            });
          })
          .sort((a, b) => a.getTime() - b.getTime());

        const nextTime = dates.find((e) => e.getTime() > thresholdTime);
        if (!nextTime)
          throw new Error(
            "Current date time is out of range of the trigger date time.",
          );
        o[k] = nextTime;
      } else if (k === "everyDay" && v === true) {
        const dates = setTimeValues
          .map((tt) => {
            const temp = new Date(this.nowTime);
            const [hours, mins, secs = 0] = tt.split(":").map(Number);
            temp.setHours(hours, mins, secs, 0);
            return temp;
          })
          .sort((a, b) => a.getTime() - b.getTime());

        let nextTime = dates.find((e) => e.getTime() > thresholdTime);

        if (!nextTime) {
          const nextDayDates = setTimeValues
            .map((tt) => {
              const temp = new Date(this.nowTime);
              temp.setDate(temp.getDate() + 1);
              const [hours, mins, secs = 0] = tt.split(":").map(Number);
              temp.setHours(hours, mins, secs, 0);
              return temp;
            })
            .sort((a, b) => a.getTime() - b.getTime());

          nextTime = nextDayDates.find((e) => e.getTime() > thresholdTime);
        }
        if (nextTime) o[k] = nextTime;
      }

      return o;
    }, {});

    if (this.triggerOffset > 0) {
      this.dateKeys.forEach((key) => {
        if (rawValues[key]) {
          rawValues[key].setTime(rawValues[key].getTime() + this.triggerOffset);
        }
      });
    }

    return rawValues;
  }
}
