import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import styles from './error.module.css';
import flatlineSkull from './error-flatline.svg';
import { ErrorTechAnimation } from './error-tech-animation';

export function Error({ error }) {
  const flatlined = !error.status;

  const getMessage = () => {
    switch (error.status) {
      case 404:
        return {
          summary: 'Recurso no encontrado',
          message: 'La página que buscas no existe o fue removida.',
        };
      case 405:
        return {
          summary: 'Método no permitido',
          message: 'La solicitud no está permitida en este recurso.',
        };
      case 403:
        return {
          summary: 'Acceso denegado',
          message: 'No tienes permisos para acceder a este recurso.',
        };
      case 503:
        return {
          summary: 'Servicio no disponible',
          message: 'El servicio está temporalmente fuera de línea. Intenta de nuevo en unos minutos.',
        };
      default:
        return {
          summary: flatlined ? 'Error crítico' : `Error ${error.status || ''}`.trim(),
          message: flatlined
            ? 'Se produjo un error inesperado en la aplicación.'
            : 'Ocurrió un error al procesar tu solicitud.',
        };
    }
  };

  const { summary, message } = getMessage();

  return (
    <section className={styles.page}>
      {flatlined && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
            [data-theme='dark'] {
              --primary: oklch(69.27% 0.242 25.41);
              --accent: oklch(69.27% 0.242 25.41);
            }
            [data-theme='light'] {
              --primary: oklch(56.29% 0.182 26.5);
              --accent: oklch(56.29% 0.182 26.5);
            }
          `,
          }}
        />
      )}
      <Transition in>
        {({ visible }) => (
          <>
            <div className={styles.details}>
              <div className={styles.text}>
                {!flatlined && (
                  <Heading
                    className={styles.title}
                    data-visible={visible}
                    level={0}
                    weight="bold"
                  >
                    {error.status}
                  </Heading>
                )}
                {flatlined && (
                  <Heading
                    className={styles.titleFlatline}
                    data-visible={visible}
                    level={2}
                    as="h1"
                  >
                    <svg width="60" height="80" viewBox="0 0 60 80">
                      <use href={`${flatlineSkull}#skull`} />
                    </svg>
                    <DecoderText text="Flatlined" start={visible} delay={300} />
                  </Heading>
                )}
                {!flatlined && (
                  <Heading
                    aria-hidden
                    className={styles.subheading}
                    data-visible={visible}
                    as="h2"
                    level={4}
                  >
                    <DecoderText text={summary} start={visible} delay={300} />
                  </Heading>
                )}
                <Text className={styles.description} data-visible={visible} as="p">
                  {message}
                </Text>
                <Button
                  secondary
                  iconHoverShift
                  className={styles.button}
                  data-visible={visible}
                  href="/"
                  icon="chevron-right"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>

            <div className={styles.videoContainer} data-visible={visible}>
              <ErrorTechAnimation flatlined={flatlined} />
            </div>
          </>
        )}
      </Transition>
    </section>
  );
}
