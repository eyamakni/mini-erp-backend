import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT ?? 587),
      secure: false, 
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
async sendAccountDisabledEmail(params: {
  to: string;
  fullName: string;
  reason?: string;
}) {
  const from = process.env.MAIL_FROM || process.env.MAIL_USER;

  const subject = 'Notification — Compte désactivé';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Bonjour ${this.escape(params.fullName)},</h2>

      <p>
        Nous vous informons que votre <b>compte Mini-ERP a été désactivé</b>.
      </p>

      ${
        params.reason
          ? `<p><b>Motif :</b> ${this.escape(params.reason)}</p>`
          : ''
      }

      <p style="color:#b00020;">
        Vous n’avez désormais plus accès à la plateforme.
      </p>

      <p>
        Pour toute question, veuillez contacter le service RH.
      </p>

      <p>— L’équipe Mini-ERP</p>
    </div>
  `;

  try {
    await this.transporter.sendMail({
      from,
      to: params.to,
      subject,
      html,
    });

    this.logger.log(`Account disabled email sent to ${params.to}`);
  } catch (err: any) {
    this.logger.error(
      `Failed to send disabled account email to ${params.to}`,
      err?.stack || err,
    );
  }
}
async sendAdminNewLeaveEmail(params: {
  to: string;
  leaveId: number;
  employeeUserId: number;
  startDate: string;
  endDate: string;
  type: string;
}) {
  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  const subject = 'Nouvelle demande de congé (PENDING)';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h3>Nouvelle demande de congé</h3>
      <ul>
        <li><b>Leave ID:</b> ${params.leaveId}</li>
        <li><b>Employee ID:</b> ${params.employeeUserId}</li>
        <li><b>Type:</b> ${this.escape(params.type)}</li>
        <li><b>Du:</b> ${this.escape(params.startDate)}</li>
        <li><b>Au:</b> ${this.escape(params.endDate)}</li>
      </ul>
      <p>Veuillez traiter cette demande dans l’espace Admin.</p>
    </div>
  `;

  await this.transporter.sendMail({ from, to: params.to, subject, html });
}
async sendLeaveDecisionEmail(params: {
  to: string;
  fullName: string;
  status: string; 
  startDate: string;
  endDate: string;
  comment?: string;
}) {
  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  const subject = `Décision congé — ${params.status}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Bonjour ${this.escape(params.fullName)},</h2>
      <p>Votre demande de congé a été <b>${this.escape(params.status)}</b>.</p>
      <ul>
        <li><b>Du:</b> ${this.escape(params.startDate)}</li>
        <li><b>Au:</b> ${this.escape(params.endDate)}</li>
      </ul>
      ${params.comment ? `<p><b>Commentaire Admin:</b> ${this.escape(params.comment)}</p>` : ''}
      <p>— Mini-ERP</p>
    </div>
  `;

  await this.transporter.sendMail({ from, to: params.to, subject, html });
}

  async sendWelcomeEmployeeEmail(params: {
    to: string;
    fullName: string;
    email: string;
    tempPassword: string;
    position: string;
  }) {
    const from = process.env.MAIL_FROM || process.env.MAIL_USER;

    const subject = 'Bienvenue — Accès à votre compte Mini-ERP';
    const html = this.welcomeTemplate(params);

    try {
      await this.transporter.sendMail({
        from,
        to: params.to,
        subject,
        html,
      });

      this.logger.log(`Welcome email sent to ${params.to}`);
      return { ok: true };
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${params.to}`, err?.stack || err);
      return { ok: false };
    }
  }

private welcomeTemplate(p: {
  fullName: string;
  email: string;       
  tempPassword: string;
  position: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Bienvenue ${this.escape(p.fullName)} </h2>

      <p>
        Votre compte a été créé sur <b>Mini-ERP</b>.
      </p>

      <p>
        <b>⚠️ Important :</b> veuillez utiliser votre
        <b>email professionnel</b> ci-dessous pour vous connecter.
      </p>

      <h3>Vos informations de connexion</h3>
      <ul>
        <li>
          <b>Email professionnel :</b><br/>
          ${this.escape(p.email)}
        </li>
        <li>
          <b>Mot de passe temporaire :</b><br/>
          ${this.escape(p.tempPassword)}
        </li>
        <li>
          <b>Poste :</b><br/>
          ${this.escape(p.position)}
        </li>
      </ul>

      <p style="color:#b00020; font-weight: bold;">
        Pour des raisons de sécurité, vous devrez changer votre mot de passe
        lors de votre première connexion.
      </p>

      <p>
        🔗 Lien de connexion :
        <a href="http://localhost:4200/login">
          Accéder à la plateforme
        </a>
      </p>

      <p>
        — L’équipe Mini-ERP
      </p>
    </div>
  `;
}


  private escape(s: string) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
