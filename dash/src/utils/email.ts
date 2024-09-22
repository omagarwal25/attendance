import { env } from "~env/server.mjs";
import nodemailer from "nodemailer";

export const createTransport = () =>
  nodemailer.createTransport({
    host: env.EMAIL_SERVER_HOST,
    port: parseInt(env.EMAIL_SERVER_PORT),
    requireTLS: true,
    secure: true,
    auth: {
      // credentials: {
      //   pass: env.EMAIL_SERVER_PASSWORD,
      //   user: env.EMAIL_SERVER_USER,
      // },
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
    from: env.EMAIL_FROM,
  });

export function hoursRequestEmail(params: {
  acceptUrl: string;
  denyUrl: string;
  email: string;
  startAt: Date;
  endAt: Date;
}) {
  const { acceptUrl, denyUrl, email, startAt, endAt } = params;

  const escapedEmail = email.replace(/\./g, "&#8203;.");

  const denyColor = "#dc2626";
  const acceptColor = "#16a34a";

  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    acceptButtonBackground: acceptColor,
    acceptButtonBorder: acceptColor,
    denyButtonBackground: denyColor,
    denyButtonBorder: denyColor,
    buttonText: "#fff",
  };

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground
    }; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text
    };">
          ${escapedEmail} has made a request for hours. The request is for ${startAt.toDateString()} from ${startAt.toLocaleTimeString()} to ${endAt.toLocaleTimeString()}.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <button align="center" style="border-radius: 5px; background-color: ${color.denyButtonBackground};" bgcolor="${color.denyButtonBackground
    }">
                <a href="${denyUrl}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText
    }; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.denyButtonBackground
    }; display: inline-block; font-weight: bold;">
                  Deny Request
                </a>
              </button>
            <button align="center" style="border-radius: 5px; background-color: ${color.acceptButtonBackground};" bgcolor="${color.acceptButtonBackground
    }">
                <a href="${acceptUrl}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText
    }; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.acceptButtonBorder
    }; display: inline-block; font-weight: bold;">
                  Accept Request
                </a>
              </button>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text
    };">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}
