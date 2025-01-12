import { Request, Response } from "express";

import { z } from "zod";
import { ErrorMessageValidation } from "../utils/errorMessageValidation";
import dayjs from "dayjs";
import { FocusTimeModel } from "../models/focus-time-model";

export class FocusTimeController {
  store = async (request: Request, response: Response) => {
    const schema = z.object({
      timeFrom: z.coerce.date(),
      timeTo: z.coerce.date(),
    });

    const focusTime = schema.safeParse(request.body);

    if (!focusTime.success) {
      const errors = ErrorMessageValidation(focusTime.error.issues);

      return response.status(422).json({ message: errors });
    }

    const timeFrom = dayjs(focusTime.data?.timeFrom);
    const timeTo = dayjs(focusTime.data?.timeTo);

    const isTimeToBeforeTimeFrom = timeTo.isBefore(timeFrom);

    if (isTimeToBeforeTimeFrom) {
      return response
        .status(400)
        .json({ message: "timeFrom always has to be before timeTo" });
    }

    const createdFocusTime = await FocusTimeModel.create({
      timeFrom: timeFrom.toDate(),
      timeTo: timeTo.toDate(),
      userId: request.user.id,
    });

    return response.status(201).json(createdFocusTime);
  };

  index = async (request: Request, response: Response) => {
    const schema = z.object({
      date: z.coerce.date(),
    });

    const validated = schema.safeParse(request.query);

    if (!validated.success) {
      const errors = ErrorMessageValidation(validated.error.issues);

      return response.status(422).json({ message: errors });
    }

    const startDate = dayjs(validated.data.date).startOf("day");
    const endDate = dayjs(validated.data.date).endOf("day");

    const focusTimes = await FocusTimeModel.find({
      timeFrom: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
      userId: request.user.id,
    }).sort({
      timeFrom: 1,
    });

    return response.status(200).json(focusTimes);
  };

  metricsByMonth = async (request: Request, response: Response) => {
    const schema = z.object({
      date: z.coerce.date(),
    });

    const validated = schema.safeParse(request.query);

    if (!validated.success) {
      const errors = ErrorMessageValidation(validated.error.issues);

      return response.status(422).json({ message: errors });
    }

    const startDate = dayjs(validated.data.date).startOf("month");
    const endDate = dayjs(validated.data.date).endOf("month");

    const focusTimesMetrics = await FocusTimeModel.aggregate()
      .match({
        timeFrom: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate(),
        },
        userId: request.user.id,
      })
      .project({
        year: {
          $year: "$timeFrom",
        },
        month: {
          $month: "$timeFrom",
        },
        day: {
          $dayOfMonth: "$timeFrom",
        },
      })
      .group({
        _id: ["$year", "$month", "$day"],
        count: {
          $sum: 1,
        },
      })
      .sort({
        _id: 1,
      });

    return response.status(200).json(focusTimesMetrics);
  };
}
